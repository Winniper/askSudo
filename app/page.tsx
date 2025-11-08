import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'


export default async function Home() {
  const session = await auth.api.getSession({headers:await headers()})

  if (session){
    redirect("/dashboard")
  }

  return (
    <div>
      <Navbar />
      <Hero />
    </div>
  );
}


