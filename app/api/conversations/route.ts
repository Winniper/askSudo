import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// GET /api/conversations - List user's conversations
export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        include: {
            messages: {
                take: 1,
                orderBy: { createdAt: "asc" }
            }
        }
    })

    return NextResponse.json(conversations)
}

// POST /api/conversations - Create new conversation
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title } = body

    const conversation = await prisma.conversation.create({
        data: {
            userId: session.user.id,
            title: title || null
        }
    })

    return NextResponse.json(conversation)
}
