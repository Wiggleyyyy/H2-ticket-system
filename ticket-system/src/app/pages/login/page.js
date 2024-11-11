'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/utils/supabase/client"; // Ensure this imports your Supabase client
import { setCookie } from 'cookies-next'; // For cookie handling

export default function WorkerLogin() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!email || !password) {
      return toast({
        variant: "destructive",
        title: "Missing fields.",
        description: "Please fill out email and password.",
      });
    }

    const loginSuccessful = await Login();
    if (loginSuccessful) {
      // Redirect to dashboard on successful login
      router.push("./dashboard/");
    }
  }

  async function Login() {
    try {
      // Query the Medarbejdere table to find the user by email
      const { data, error } = await supabase
        .from('Medarbejdere')
        .select('*')
        .eq('Mail', email)
        .single();

      // Check for errors in the query
      if (error || !data) {
        return toast({
          variant: "destructive",
          title: "Error logging in",
          description: "Email not found. Please check your email.",
        });
      }

      // Here, assume a simple password check for demonstration (not recommended for production)
      if (password !== data.HashedPassword) {
        return toast({
          variant: "destructive",
          title: "Error logging in",
          description: "Incorrect password. Please try again.",
        });
      }

      // Set cookie for session management
      setCookie('user', JSON.stringify({ data }), { maxAge: 60 * 60 * 24 }); // 1 day session

      toast({
        title: "Login successful",
        description: "Successfully logged in, redirecting to the dashboard.",
      });

      return true; // Return true if login is successful
    } catch (err) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: `${err.message}`,
      });
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
  );
}