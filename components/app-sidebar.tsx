"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import useSWR from "swr"
import {
  FileText,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  Trash2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"

type Conversation = {
  id: string
  title: string | null
  updatedAt: string
  messages: { content: string }[]
}

type Document = {
  id: string
  fileName: string
  status: string
  createdAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) return []
  return res.json()
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Fetch conversations
  const { data: conversations = [], mutate: mutateConversations } = useSWR<Conversation[]>(
    '/api/conversations',
    fetcher,
    { refreshInterval: 5000 }
  )

  // Fetch documents
  const { data: documents = [] } = useSWR<Document[]>(
    '/api/documents',
    fetcher,
    { refreshInterval: 10000 }
  )

  const handleDeleteConversation = async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    mutateConversations()
    if (pathname === `/chat/${id}`) {
      router.push('/dashboard')
    }
  }

  const handleNewChat = () => {
    router.push('/chat/new')
  }

  return (
    <Sidebar collapsible="icon" className="bg-black border-r border-white/10" {...props}>
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleNewChat}
              tooltip="New Chat"
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Conversations */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50">
            Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/chat/${conv.id}`}
                    className="text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-white"
                  >
                    <Link href={`/chat/${conv.id}`}>
                      <MessageSquare className="h-4 w-4" />
                      <span className="truncate">
                        {conv.title || conv.messages[0]?.content?.slice(0, 30) || "New chat"}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction className="text-white/50 hover:text-white">
                        <MoreHorizontal />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      className="bg-black/90 border-white/20"
                    >
                      <DropdownMenuItem
                        onClick={() => handleDeleteConversation(conv.id)}
                        className="text-red-400 focus:text-red-300 focus:bg-red-500/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
              {conversations.length === 0 && !isCollapsed && (
                <p className="px-3 py-2 text-sm text-white/40">
                  No conversations yet
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Documents */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50">
            Documents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {documents.map((doc) => (
                <SidebarMenuItem key={doc.id}>
                  <SidebarMenuButton
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{doc.fileName}</span>
                    {!isCollapsed && doc.status === "processing" && (
                      <span className="ml-auto text-xs text-yellow-400">Processing</span>
                    )}
                    {!isCollapsed && doc.status === "ready" && (
                      <span className="ml-auto text-xs text-green-400">Ready</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {documents.length === 0 && !isCollapsed && (
                <p className="px-3 py-2 text-sm text-white/40">
                  No documents uploaded
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
