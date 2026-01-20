import { streamText, UIMessage, convertToModelMessages } from "ai"
import { auth } from "@/lib/auth"
import { retrieveContext } from "@/lib/ingestion"

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json()

    // Get user session for context filtering
    const session = await auth.api.getSession({
        headers: req.headers
    })

    let systemPrompt = "You are a helpful AI assistant."

    // If user is authenticated, try to retrieve relevant context
    if (session?.user?.id) {
        const lastUserMessage = messages
            .filter(m => m.role === "user")
            .pop()

        if (lastUserMessage) {
            // Extract text from the last user message
            const queryText = lastUserMessage.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map(p => p.text)
                .join(" ") || ""

            if (queryText) {
                try {
                    const contextChunks = await retrieveContext(queryText, session.user.id)

                    if (contextChunks.length > 0) {
                        const contextText = contextChunks.join("\n\n---\n\n")
                        systemPrompt = `You are a helpful AI assistant. Use the following context from the user's uploaded documents to answer their questions. If the context doesn't contain relevant information, you can still answer based on your general knowledge, but mention that the answer isn't from their documents.

CONTEXT FROM DOCUMENTS:
${contextText}

END OF CONTEXT`
                    }
                } catch (error) {
                    console.error("[RAG] Failed to retrieve context:", error)
                    // Continue without context if retrieval fails
                }
            }
        }
    }

    const result = await streamText({
        model: 'google/gemini-2.5-flash-lite',
        system: systemPrompt,
        messages: convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
}