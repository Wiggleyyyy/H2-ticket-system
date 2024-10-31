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
import { Textarea } from "@/components/ui/textarea"
import { Ticket, UserCog } from "lucide-react"
import Link from "next/link"

export default function Component() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [deviceOrBrowser, setDeviceOrBrowser] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email && !phone) {
      setError("Please provide either an email or a phone number.");
      return;
    }
    setError("");
    // Here you would typically send the ticket data to your backend
    console.log("Ticket submitted:", { name, email, phone, description, errorCode, ticketTitle, deviceOrBrowser });
    // Reset form fields
    setName("");
    setEmail("");
    setPhone("");
    setDescription("");
    setErrorCode("");
    setDeviceOrBrowser("");
    setTicketTitle("");

    //add success toast
  }

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
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Workers</h3>
            <Link href="/worker/login">
              <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                <UserCog className="h-6 w-6 mr-2" />
                Worker Login
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Submit a Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticketTitle">Ticket Title</Label>
                <Input
                  id="ticketTitle"
                  placeholder="Title of ticket"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceOrBrowser">Browser/Device</Label>
                <Input
                  id="deviceOrBrowser"
                  placeholder="Either device or browser"
                  value={deviceOrBrowser}
                  onChange={(e) => setDeviceOrBrowser(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional if phone is provided)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional if email is provided)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Example: +45 01 23 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="errorCode">Error Code (If provided)</Label>
                <Input
                  id="errorCode"
                  type="number"
                  placeholder="Example: 404"
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Ticket Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">Submit Ticket</Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground text-center">
          We'll respond to your ticket as soon as possible.
        </CardFooter>
      </Card>
    </div>
  )
}
