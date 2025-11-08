import SignInForm from '@/components/signinform'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import PixelBlast from '@/components/ui/PixelBlast'
import Link from 'next/link'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const SignIn = async () => {
  const session = await auth.api.getSession({headers: await headers()})

  if (session){
    redirect("/dashboard")
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center py-20">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <PixelBlast 
          color="#7C7C7E" 
          className="w-full h-full"
        />
      </div>
      <Card className='w-full max-w-sm backdrop-blur-md bg-black/40 border-white/20'>
        <CardHeader>
          <CardTitle className="text-white">Sign In</CardTitle>
          <CardDescription className="text-white/70">Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline font-semibold">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SignIn