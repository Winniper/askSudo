import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// POST /api/conversations/[id]/messages - Add message to conversation
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { role, content } = body

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            userId: session.user.id
        }
    })

    if (!conversation) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Create message
    const message = await prisma.chatMessage.create({
        data: {
            conversationId: id,
            role,
            content
        }
    })

    // Update conversation title if first user message and no title
    if (role === 'user' && !conversation.title) {
        await prisma.conversation.update({
            where: { id },
            data: { title: content.slice(0, 50) }
        })
    }

    // Update conversation's updatedAt
    await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() }
    })

    return NextResponse.json(message)
}
