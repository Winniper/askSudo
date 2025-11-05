"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState } from "react"

export default function Chat() {
    const {messages, sendMessage, status} = useChat()
    
    return (
        <>
        </>
    )
}