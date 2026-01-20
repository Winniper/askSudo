// @ts-expect-error - pdf-parse v1 doesn't have types
import pdf from "pdf-parse/lib/pdf-parse.js"
import { embed } from "ai"
import { google } from "@ai-sdk/google"
import { getPineconeIndex } from "./pinecone"
import prisma from "./prisma"

// ============================================================================
// Types
// ============================================================================

export type ChunkWithEmbedding = {
    text: string
    embedding: number[]
    index: number
}

export type IngestionResult = {
    success: boolean
    chunksProcessed: number
    error?: string
}

// ============================================================================
// PDF Fetching & Parsing
// ============================================================================

export async function fetchPdf(url: string): Promise<Buffer> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`)
    }
    return Buffer.from(await response.arrayBuffer())
}

export async function parsePdf(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer)
    return data.text
}

// ============================================================================
// Text Chunking
// ============================================================================

export function chunkText(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
): string[] {
    const chunks: string[] = []

    // Clean up the text - remove excessive whitespace
    const cleanedText = text.replace(/\s+/g, " ").trim()

    if (cleanedText.length === 0) {
        return []
    }

    // Ensure overlap is smaller than chunkSize
    const effectiveOverlap = Math.min(overlap, chunkSize - 1)
    const step = chunkSize - effectiveOverlap

    let start = 0
    while (start < cleanedText.length) {
        const end = Math.min(start + chunkSize, cleanedText.length)
        const chunk = cleanedText.slice(start, end).trim()

        if (chunk.length > 0) {
            chunks.push(chunk)
        }

        // If we've reached the end, break
        if (end >= cleanedText.length) {
            break
        }

        // Move start by step amount (chunkSize - overlap)
        start += step
    }

    return chunks
}

// ============================================================================
// Embedding Generation
// ============================================================================

export async function generateEmbeddings(
    chunks: string[]
): Promise<ChunkWithEmbedding[]> {
    const results: ChunkWithEmbedding[] = []

    // Process in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)

        const batchResults = await Promise.all(
            batch.map(async (chunk, batchIndex) => {
                const { embedding } = await embed({
                    model: google.textEmbeddingModel("text-embedding-004"),
                    value: chunk,
                })

                return {
                    text: chunk,
                    embedding,
                    index: i + batchIndex,
                }
            })
        )

        results.push(...batchResults)
    }

    return results
}

// ============================================================================
// Pinecone Upsert
// ============================================================================

export async function upsertToPinecone(
    documentId: string,
    userId: string,
    embeddings: ChunkWithEmbedding[]
): Promise<void> {
    const index = getPineconeIndex()

    const vectors = embeddings.map(({ embedding, text, index: chunkIndex }) => ({
        id: `${documentId}-chunk-${chunkIndex}`,
        values: embedding,
        metadata: {
            documentId,
            userId,
            chunkIndex,
            text,
        },
    }))

    // Upsert in batches of 100 (Pinecone limit)
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize)
        await index.upsert(batch)
    }
}

// ============================================================================
// Main Ingestion Function
// ============================================================================

export async function ingestDocument(
    documentId: string,
    fileUrl: string,
    userId: string
): Promise<IngestionResult> {
    try {
        // Update status to processing
        await prisma.document.update({
            where: { id: documentId },
            data: { status: "processing" },
        })

        // 1. Fetch the PDF
        console.log(`[Ingestion] Fetching PDF: ${fileUrl}`)
        const pdfBuffer = await fetchPdf(fileUrl)

        // 2. Parse the PDF to extract text
        console.log(`[Ingestion] Parsing PDF...`)
        const text = await parsePdf(pdfBuffer)

        if (!text || text.trim().length === 0) {
            throw new Error("No text content found in PDF")
        }

        // 3. Chunk the text
        console.log(`[Ingestion] Chunking text (${text.length} chars)...`)
        const chunks = chunkText(text)
        console.log(`[Ingestion] Created ${chunks.length} chunks`)

        if (chunks.length === 0) {
            throw new Error("No chunks created from PDF text")
        }

        // 4. Generate embeddings
        console.log(`[Ingestion] Generating embeddings...`)
        const embeddings = await generateEmbeddings(chunks)

        // 5. Upsert to Pinecone
        console.log(`[Ingestion] Upserting to Pinecone...`)
        await upsertToPinecone(documentId, userId, embeddings)

        // 6. Update status to ready
        await prisma.document.update({
            where: { id: documentId },
            data: { status: "ready" },
        })

        console.log(`[Ingestion] Complete! Processed ${chunks.length} chunks`)

        return {
            success: true,
            chunksProcessed: chunks.length,
        }
    } catch (error) {
        console.error(`[Ingestion] Failed:`, error)

        // Update status to failed
        await prisma.document.update({
            where: { id: documentId },
            data: { status: "failed" },
        })

        return {
            success: false,
            chunksProcessed: 0,
            error: error instanceof Error ? error.message : "Unknown error",
        }
    }
}

// ============================================================================
// RAG Retrieval (for chat)
// ============================================================================

export async function retrieveContext(
    query: string,
    userId: string,
    topK: number = 5
): Promise<string[]> {
    // Generate embedding for the query
    const { embedding } = await embed({
        model: google.textEmbeddingModel("text-embedding-004"),
        value: query,
    })

    // Query Pinecone
    const index = getPineconeIndex()
    const results = await index.query({
        vector: embedding,
        topK,
        includeMetadata: true,
        filter: { userId },
    })

    // Extract text from matches
    const contextChunks = results.matches
        ?.filter(match => match.metadata?.text)
        .map(match => match.metadata!.text as string) || []

    return contextChunks
}
