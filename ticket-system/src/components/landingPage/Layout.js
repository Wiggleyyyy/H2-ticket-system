// components/Layout.js
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Ticket } from "lucide-react"
  
  export default function Layout({ children }) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Ticket className="h-6 w-6" />
              Ticket System
            </CardTitle>
            <CardDescription>
              Welcome to our support ticket system. Workers can log in, or customers can submit a ticket below.
            </CardDescription>
            <CardTitle>
              Ring til os: +45 12 34 56 78
            </CardTitle>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground text-center">
            We'll respond to your ticket as soon as possible.
          </CardFooter>
        </Card>
      </div>
    )
  }