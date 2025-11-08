"use client"

import { set, z } from "zod"
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
import { signUp } from "@/lib/auth-client"


const formSchema = z.object({
    name : z.string().min(2).max(20),
    email : z.string().email(),
    password : z.string().min(8).max(20),
})

const SignInForm = () => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    setIsLoading(true)
    const res = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        })  
        if(res.error){
            setError(res.error.message || "An error occurred")
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
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder="Name" 
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
                        {!form.formState.errors.email && (
                            <FormDescription className="text-white/60">
                                Please enter your email address.
                            </FormDescription>
                        )}
                        <FormMessage className="text-red-400" />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                            <Input 
                                type="password" 
                                placeholder="Password" 
                                {...field} 
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            />
                        </FormControl>
                        {!form.formState.errors.password && (
                            <FormDescription className="text-white/60">
                                Your password must be at least 8 characters long.
                            </FormDescription>
                        )}
                        <FormMessage className="text-red-400" />
                    </FormItem>
                )}
            />
            <Button type="submit" variant="secondary" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Create an Account"}
            </Button>
        </form>
    </Form>
  )
}

export default SignInForm