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
    const hasSentPendingRef = useRef(false)
    useEffect(() => {
        if (pendingMessage && !hasSentPendingRef.current && status === 'ready') {
            hasSentPendingRef.current = true
            // Save user message to DB and send to LLM
            fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', content: pendingMessage })
            }).then(() => {
                sendMessage({ text: pendingMessage })
            })
        }
    }, [pendingMessage, status, conversationId, sendMessage])

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
        <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-black">
            {/* Messages area - scrollable */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <Conversation className="h-full">
                    <ConversationContent className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
                        {messages.map((message, index) => (
                            <Message
                                from={message.role}
                                key={message.id}
                                className={message.role === 'user'
                                    ? 'ml-auto max-w-[85%] md:max-w-[70%]'
                                    : 'mr-auto max-w-[95%] md:max-w-[85%]'
                                }
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex items-start gap-3">
                                        {/* Assistant avatar */}
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                                                <path d="M5 19l1 3 1-3M18 19l1 3 1-3" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <MessageContent className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                                            {message.parts.map((part, i) => {
                                                switch (part.type) {
                                                    case 'text':
                                                        return (
                                                            <MessageResponse key={`${message.id}-${i}`} className="text-white/90 leading-relaxed">
                                                                {part.text}
                                                            </MessageResponse>
                                                        )
                                                    default:
                                                        return null
                                                }
                                            })}
                                        </MessageContent>
                                    </div>
                                )}
                                {message.role === 'user' && (
                                    <MessageContent className="bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 rounded-2xl rounded-tr-sm px-4 py-3">
                                        {message.parts.map((part, i) => {
                                            switch (part.type) {
                                                case 'text':
                                                    return (
                                                        <MessageResponse key={`${message.id}-${i}`} className="text-white leading-relaxed">
                                                            {part.text}
                                                        </MessageResponse>
                                                    )
                                                default:
                                                    return null
                                            }
                                        })}
                                    </MessageContent>
                                )}
                            </Message>
                        ))}

                        {/* Loading indicator */}
                        {(status === 'submitted' || status === 'streaming') && (
                            <div className="mr-auto max-w-[85%] md:max-w-[70%]">
                                <div className="flex items-start gap-3">
                                    {/* Animated avatar */}
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center animate-pulse">
                                        <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                                            <path d="M5 19l1 3 1-3M18 19l1 3 1-3" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                                            </div>
                                            <span className="text-white/50 text-sm font-medium">
                                                {status === 'submitted' ? 'Thinking...' : 'Generating response...'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
            </div>

            {/* Prompt input - fixed at bottom */}
            <div className="shrink-0 p-4 pb-6 border-t border-white/10 bg-black">
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
