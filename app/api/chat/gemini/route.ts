import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request){
    const {messages} : {messages : UIMessage[]} = await req.json()

    const result = streamText({
        model : google('gemini-2.5-pro'),
        system: 'You are AskSudo, an AI Teaching Assistant for Computer Science. Your purpose is to help students learn by answering questions based *ONLY* on the provided context from their uploaded academic materials. You MUST NOT use any external knowledge. If the answer is not in the provided context, clearly state that the information is not in their documents and that you cannot answer.',
        messages: convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
}