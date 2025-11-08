import LogInForm from '@/components/loginform'
import PixelBlast from '@/components/ui/PixelBlast'
import Link from 'next/link'
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const LogIn = () => {
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
          <CardTitle className="text-white">Log In</CardTitle>
          <CardDescription className="text-white/70">Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <LogInForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-white/70 text-sm">
            Don't have an account?{' '}
            <Link href="/signin" className="text-white hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default LogIn