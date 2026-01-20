import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ingestDocument } from "@/lib/ingestion";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing()

export const uploadRouter = {
    pdfUpload: f(["pdf"])
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({
                headers: req.headers
            })

            if (!session) throw new UploadThingError("Unauthorized")

            return { userId: session.user.id }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("[DEBUG 1] onUploadComplete called")
            console.log("Upload completed for userID: ", metadata.userId)
            console.log("File URL: ", file.ufsUrl)

            console.log("[DEBUG 2] About to create document in DB")

            let document
            try {
                document = await prisma.document.create({
                    data: {
                        userId: metadata.userId,
                        fileName: file.name,
                        fileUrl: file.ufsUrl,
                        fileKey: file.key,
                        fileSize: file.size,
                        mimeType: file.type,
                        status: "pending"
                    }
                })
                console.log("[DEBUG 3] Document created:", document.id)
            } catch (dbError) {
                console.error("[DEBUG 3] Prisma error:", dbError)
                throw dbError
            }

            console.log("[DEBUG 4] Starting ingestion for document:", document.id)

            try {
                const result = await ingestDocument(document.id, file.ufsUrl, metadata.userId)
                console.log("[DEBUG 5] Ingestion result:", result)
                if (result.success) {
                    console.log(`[Ingestion] Document ${document.id} processed: ${result.chunksProcessed} chunks`)
                } else {
                    console.error(`[Ingestion] Document ${document.id} failed: ${result.error}`)
                }
            } catch (err) {
                console.error("[DEBUG 5] Ingestion error:", err)
            }

            console.log("[DEBUG 6] Returning documentId")
            return { documentId: document.id }
        })
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter