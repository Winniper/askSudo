"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"

const formSchema = z.object({
    email : z.email(),
    password : z.string().min(8).max(20),
})

const LogInForm = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    setIsLoading(true)
    
    const res = await signIn.email({
      email: values.email,
      password: values.password,
   })   

    if(res.error){
        setError("Invalid email or password")
        setIsLoading(false)
    } else {
        router.push("/dashboard")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="me@example.com" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white data-[error=true]:text-white">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Password" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" variant="secondary" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  )
}

export default LogInForm