"use client"

import { useChat } from "@ai-sdk/react"
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
    PromptInputButton,
    type PromptInputMessage,
    PromptInputSelect,
    PromptInputSelectContent,
    PromptInputSelectItem,
    PromptInputSelectTrigger,
    PromptInputSelectValue,
    PromptInputSpeechButton,
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

const ChatBot = () => {
    const [input, setInput] = useState<string>('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { messages, status, sendMessage } = useChat()

    const handleSubmit = (message: PromptInputMessage) => {
        const hasText = Boolean(message.text)
        const hasAttachment = Boolean(message.files?.length)

        if (!(hasAttachment || hasText)) {
            return;
        }

        sendMessage({
            text: message.text || "Sent an attachment",
            files: message.files
        },
        )
        setInput('')
    }
    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-full">
            <div className="flex flex-col h-full">
                <Conversation>
                    <ConversationContent>
                        {messages.map((message) => (
                            <Message from={message.role} key={message.id}>
                                <MessageContent>
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
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>
                <PromptInput onSubmit={handleSubmit} globalDrop multiple className="mt-4">
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
                        />
                    </PromptInputBody>
                    <PromptInputFooter>
                        <PromptInputTools>
                            <PromptInputActionMenu>
                                <PromptInputActionMenuTrigger />
                                <PromptInputActionMenuContent>
                                    <PromptInputActionAddAttachments />
                                </PromptInputActionMenuContent>
                            </PromptInputActionMenu>
                        </PromptInputTools>
                        <PromptInputSubmit status={status} />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    )
}

export default ChatBot