"use client"

import { useChat } from "@ai-sdk/react"
import { useRef, useState, useEffect } from "react"
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
import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { useUploadThing } from "@/lib/uploadthing"

type InitialMessage = {
    id: string
    role: "user" | "assistant"
    content: string
    createdAt: Date
}

interface ChatInterfaceProps {
    conversationId: string
    initialMessages: InitialMessage[]
    pendingMessage?: string
}

export default function ChatInterface({ conversationId, initialMessages, pendingMessage }: ChatInterfaceProps) {
    const [input, setInput] = useState<string>('')
    const [hasSentPending, setHasSentPending] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { messages, status, sendMessage, setMessages } = useChat({
        id: conversationId,
        onFinish: async (context) => {
            // Save assistant message to database
            const msg = context.message
            const textPart = msg.parts?.find((p) => p.type === 'text') as { type: 'text'; text: string } | undefined
            await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: msg.role,
                    content: textPart?.text || ''
                })
            })
        }
    })

    const { startUpload, isUploading } = useUploadThing("pdfUpload")

    // Initialize with DB messages on mount
    useEffect(() => {
        if (initialMessages.length > 0 && messages.length === 0) {
            const uiMessages = initialMessages.map(msg => ({
                id: msg.id,
                role: msg.role,
                parts: [{ type: 'text' as const, text: msg.content }],
                createdAt: msg.createdAt
            }))
            setMessages(uiMessages)
        }
    }, [initialMessages, messages.length, setMessages])

    // Send pending message on mount (for new conversations)
    useEffect(() => {
        if (pendingMessage && !hasSentPending && status === 'ready') {
            setHasSentPending(true)
            // Save user message to DB and send to LLM
            fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', content: pendingMessage })
            }).then(() => {
                sendMessage({ text: pendingMessage })
            })
        }
    }, [pendingMessage, hasSentPending, status, conversationId, sendMessage])

    const handleSubmit = async (message: PromptInputMessage) => {
        const hasText = Boolean(message.text)
        const hasAttachment = Boolean(message.files?.length)

        if (!(hasAttachment || hasText)) {
            return
        }

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

        // Clean message text without document IDs
        const messageText = message.text || "Summarize the uploaded document"

        // Save user message to database
        await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'user',
                content: messageText
            })
        })

        sendMessage({
            text: messageText,
            files: message.files
        })
        setInput('')
    }

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Messages area */}
            <div className="flex-1 overflow-hidden">
                <Conversation className="h-full">
                    <ConversationContent className="px-4 py-6">
                        {messages.map((message) => (
                            <Message
                                from={message.role}
                                key={message.id}
                                className={message.role === 'user'
                                    ? 'ml-auto max-w-[80%]'
                                    : 'mr-auto max-w-[80%]'
                                }
                            >
                                <MessageContent
                                    className={message.role === 'user'
                                        ? 'bg-white/10 border border-white/20 rounded-2xl px-4 py-3'
                                        : 'bg-transparent'
                                    }
                                >
                                    {message.parts.map((part, i) => {
                                        switch (part.type) {
                                            case 'text':
                                                return (
                                                    <MessageResponse key={`${message.id}-${i}`}>
                                                        {part.text}
                                                    </MessageResponse>
                                                )
                                            default:
                                                return null
                                        }
                                    })}
                                </MessageContent>
                            </Message>
                        ))}

                        {/* Loading indicator */}
                        {(status === 'submitted' || status === 'streaming') && (
                            <div className="mr-auto max-w-[80%]">
                                <div className="flex items-center gap-3 py-4">
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-white/40 text-sm">
                                        {status === 'submitted' ? 'Thinking...' : 'Generating...'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
            </div>

            {/* Prompt input */}
            <div className="p-4 pb-6 border-t border-white/10">
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
                                status={status}
                                className="rounded-xl bg-white text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
                            />
                        </PromptInputFooter>
                    </PromptInput>
                </div>
            </div>
        </div>
    )
}
