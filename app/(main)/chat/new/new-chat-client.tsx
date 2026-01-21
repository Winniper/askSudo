"use client"

import { useChat } from "@ai-sdk/react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import {
    PromptInput,
    PromptInputActionAddAttachments,
    PromptInputActionMenu,
    PromptInputActionMenuContent,
    PromptInputActionMenuTrigger,
    PromptInputAttachment,
    PromptInputAttachments,
    PromptInputBody,
    type PromptInputMessage,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputTools,
    PromptInputHeader,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { useUploadThing } from "@/lib/uploadthing"

const suggestions = [
    "Summarize chapter 3 of my textbook",
    "What are the key points in this document?",
    "Create flashcards from this PDF",
    "Explain this concept in simple terms",
]

export default function NewChatClient() {
    const router = useRouter()
    const [input, setInput] = useState<string>('')
    const [isCreating, setIsCreating] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { status, sendMessage } = useChat()

    const { startUpload } = useUploadThing("pdfUpload")

    const handleSubmit = async (message: PromptInputMessage) => {
        const hasText = Boolean(message.text)
        const hasAttachment = Boolean(message.files?.length)

        if (!(hasAttachment || hasText) || isCreating) {
            return
        }

        setIsCreating(true)

        try {
            const pdfParts = message.files?.filter(f => f.mediaType === "application/pdf") || []

            let documentIds: string[] = []

            if (pdfParts.length > 0) {
                try {
                    const pdfFiles = await Promise.all(
                        pdfParts.map(async (part) => {
                            const response = await fetch(part.url)
                            const blob = await response.blob()
                            return new File([blob], part.filename || "document.pdf", {
                                type: part.mediaType
                            })
                        })
                    )

                    const results = await startUpload(pdfFiles)

                    if (results) {
                        documentIds = results.map(r => r.serverData.documentId)
                    }
                } catch (error) {
                    console.error("Upload failed:", error)
                }
            }

            const userMessageText = message.text || "Summarize the uploaded document"

            // Create conversation first (don't save message - let chat interface handle it)
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: userMessageText.slice(0, 50) })
            })
            const conv = await res.json()

            // Navigate to the conversation with the message to send
            const encodedMessage = encodeURIComponent(userMessageText)
            router.push(`/chat/${conv.id}?message=${encodedMessage}`)
        } catch (error) {
            console.error("Failed to create conversation:", error)
            setIsCreating(false)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion)
        textareaRef.current?.focus()
    }

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Centered content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="max-w-3xl w-full space-y-8 text-center">
                    {isCreating ? (
                        /* Loading state */
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-3 h-3 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-3 h-3 bg-white/50 rounded-full animate-bounce" />
                                </div>
                            </div>
                            <p className="text-white/60 text-lg">Starting conversation...</p>
                        </div>
                    ) : (
                        <>
                            {/* Heading */}
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-[#7C7C7E] bg-clip-text text-transparent">
                                What would you like to know?
                            </h1>

                            {/* Suggestions */}
                            <Suggestions className="justify-center">
                                {suggestions.map((suggestion) => (
                                    <Suggestion
                                        key={suggestion}
                                        suggestion={suggestion}
                                        onClick={handleSuggestionClick}
                                        className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30"
                                    />
                                ))}
                            </Suggestions>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom prompt input */}
            <div className="p-6 pb-8">
                <div className="max-w-3xl mx-auto">
                    <PromptInput
                        onSubmit={handleSubmit}
                        globalDrop
                        multiple
                        className="rounded-2xl border border-white/20 bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-black/20 transition-all duration-200 focus-within:border-blue-500/50 focus-within:shadow-blue-500/10 focus-within:shadow-xl [&_[data-slot=input-group]]:rounded-2xl [&_[data-slot=input-group]]:border-0 [&_[data-slot=input-group]]:bg-transparent"
                    >
                        <PromptInputHeader>
                            <PromptInputAttachments>
                                {(attachment) => <PromptInputAttachment data={attachment} />}
                            </PromptInputAttachments>
                        </PromptInputHeader>
                        <PromptInputBody>
                            <PromptInputTextarea
                                onChange={(e) => setInput(e.target.value)}
                                ref={textareaRef}
                                value={input}
                                placeholder="Ask anything..."
                                className="min-h-[52px] text-white placeholder:text-white/40 text-base"
                                disabled={isCreating}
                            />
                        </PromptInputBody>
                        <PromptInputFooter className="pb-2 pr-2">
                            <PromptInputTools>
                                <PromptInputActionMenu>
                                    <PromptInputActionMenuTrigger className="text-white/60 hover:text-white hover:bg-white/10" />
                                    <PromptInputActionMenuContent className="bg-zinc-900 border-white/20">
                                        <PromptInputActionAddAttachments />
                                    </PromptInputActionMenuContent>
                                </PromptInputActionMenu>
                            </PromptInputTools>
                            <PromptInputSubmit
                                status={isCreating ? 'streaming' : status}
                                className="rounded-xl bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
                            />
                        </PromptInputFooter>
                    </PromptInput>
                </div>
            </div>
        </div>
    )
}
