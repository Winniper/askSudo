import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import ChatInterface from '@/components/chat-interface'

export default async function ChatPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ message?: string }>
}) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        redirect("/")
    }

    const { id } = await params
    const { message } = await searchParams

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            userId: session.user.id
        },
        include: {
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    })

    if (!conversation) {
        notFound()
    }

    // Convert DB messages to UI format
    const initialMessages = conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: msg.createdAt
    }))

    // Decode the message if present (for new conversations)
    const pendingMessage = message ? decodeURIComponent(message) : undefined

    return (
        <ChatInterface
            conversationId={conversation.id}
            initialMessages={initialMessages}
            pendingMessage={pendingMessage}
        />
    )
}
