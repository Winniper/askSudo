import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, FileText, Sparkles } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/")
  }

  // Fetch recent conversations
  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "asc" }
      }
    }
  })

  // Fetch uploaded documents
  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  // Get greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full space-y-8">
          {/* Greeting */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-[#7C7C7E] bg-clip-text text-transparent">
              {greeting}, {session.user.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-white/60 text-lg">
              What would you like to learn today?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Link href="/chat/new" className="group">
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <MessageSquarePlus className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">New Chat</h3>
                    <p className="text-white/50 text-sm">Start a new conversation</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/chat/new" className="group">
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Upload Document</h3>
                    <p className="text-white/50 text-sm">Chat with your PDFs</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Conversations */}
          {conversations.length > 0 && (
            <div className="mt-12 space-y-4">
              <h2 className="text-white/80 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recent Conversations
              </h2>
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Link key={conv.id} href={`/chat/${conv.id}`}>
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <p className="text-white font-medium truncate">
                        {conv.title || conv.messages[0]?.content?.slice(0, 50) || "New conversation"}
                      </p>
                      <p className="text-white/40 text-sm mt-1">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {conversations.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-white/40">
                No conversations yet. Start a new chat to begin learning!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}