'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCog } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/app/utils/supabase/client"

export default function WorkerLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically handle the login logic

    Login()

    console.log("Login attempted with:", { email, password })
    // For demo purposes, let's just show an error if fields are empty
    if (!email || !password) {
      setError("Please fill in all fields")
    } else {
      setError("")
      // You would typically make an API call here to authenticate the user
    }
  }
  async function Login() {
    if (isLogin) {
      //login
      if (!emailInput || !passwordInput) {
        return toast({
          variant:"destructive",
          title:"Missing fields.",
          description:"Please fill out username and/or password.",
        });
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <UserCog className="h-6 w-6" />
            Worker Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the worker dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Log In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Back to landing page
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}