import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// GET /api/conversations/[id] - Get conversation with messages
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

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
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(conversation)
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.conversation.deleteMany({
        where: {
            id,
            userId: session.user.id
        }
    })

    return NextResponse.json({ success: true })
}
