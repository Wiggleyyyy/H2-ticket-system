'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Ticket } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [newTicket, setNewTicket] = useState({
    ticketTitle: "",
    name: "",
    email: "",
    phone: "",
    description: "",
    errorCode: "",
    deviceOrBrowser: "",
    createdFor: "self",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("./login")
      } else {
        fetchTickets()
      }
    }
    
    // checkSession()
  }, [router])

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('Tickets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast({
        title: "Error fetching tickets",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setTickets(data)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (newTicket.createdFor === 'customer' && !newTicket.email && !newTicket.phone) {
      setError("Please provide either an email or a phone number for the customer.")
      return
    }
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    
    const ticketData = {
      TicketNavn: newTicket.ticketTitle,
      Navn: newTicket.createdFor === 'self' ? user.user_metadata.full_name : newTicket.name,
      EnhedsOplysning: newTicket.deviceOrBrowser,
      Fejlkode: newTicket.errorCode,
      Beskrivelse: newTicket.description,
      Phone: newTicket.phone,
      Email: newTicket.email,
    }

    const { data, error } = await supabase
      .from('Tickets')
      .insert([ticketData])
      .select()

    if (error) {
      toast({
        title: "Error creating ticket",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Ticket created",
        description: "Your ticket has been successfully created.",
      })
      fetchTickets()
      setNewTicket({
        ticketTitle: "",
        name: "",
        email: "",
        phone: "",
        description: "",
        errorCode: "",
        deviceOrBrowser: "",
        createdFor: "self",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Worker Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6" />
              Create New Ticket
            </CardTitle>
            <CardDescription>Fill in the details to create a new ticket.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="createdFor">Created For</Label>
                <Select
                  value={newTicket.createdFor}
                  onValueChange={(value) => setNewTicket({...newTicket, createdFor: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who it's for" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Self</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketTitle">Ticket Title</Label>
                <Input
                  id="ticketTitle"
                  placeholder="Title of ticket"
                  value={newTicket.ticketTitle}
                  onChange={(e) => setNewTicket({...newTicket, ticketTitle: e.target.value})}
                />
              </div>
              {newTicket.createdFor === 'customer' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    placeholder="Customer's name"
                    value={newTicket.name}
                    onChange={(e) => setNewTicket({...newTicket, name: e.target.value})}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional if phone is provided)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={newTicket.email}
                  onChange={(e) => setNewTicket({...newTicket, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional if email is provided)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Example: +45 01 23 45 67"
                  value={newTicket.phone}
                  onChange={(e) => setNewTicket({...newTicket, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceOrBrowser">Browser/Device</Label>
                <Input
                  id="deviceOrBrowser"
                  placeholder="Either device or browser"
                  value={newTicket.deviceOrBrowser}
                  onChange={(e) => setNewTicket({...newTicket, deviceOrBrowser: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="errorCode">Error Code (If provided)</Label>
                <Input
                  id="errorCode"
                  type="number"
                  placeholder="Example: 404"
                  value={newTicket.errorCode}
                  onChange={(e) => setNewTicket({...newTicket, errorCode: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Ticket Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">Create Ticket</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Recent Tickets
            </CardTitle>
            <CardDescription>View and manage your recent tickets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <CardTitle>{ticket.TicketNavn}</CardTitle>
                    <CardDescription>
                      Created for: {ticket.created_for ? 'Self' : 'Customer'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{ticket.Beskrivelse}</p>
                    <p className="text-xs mt-2">Device/Browser: {ticket.EnhedsOplysning}</p>
                    {ticket.Fejlkode && <p className="text-xs">Error Code: {ticket.Fejlkode}</p>}
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      Created at: {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}