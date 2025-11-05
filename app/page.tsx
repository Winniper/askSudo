import Navbar from '@/components/navbar'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth.api.getSession({headers:await headers()})

  if (session){
    redirect("/dashboard")
  }

  return (
    <div className="container h-screen w-screen">
      <Navbar />
      Landing Page
    </div>
  );
}


