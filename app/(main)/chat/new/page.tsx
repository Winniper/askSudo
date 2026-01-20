import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import NewChatClient from './new-chat-client'

export default async function NewChatPage() {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        redirect("/")
    }

    return <NewChatClient />
}
