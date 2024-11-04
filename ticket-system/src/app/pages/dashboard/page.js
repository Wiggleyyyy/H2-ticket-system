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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Ticket, UserPlus } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [userMetadata, setUserMetadata] = useState({ email: "", phone: "", full_name: "" })
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
  const [newAccount, setNewAccount] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    phoneNumber: "",
  })
  const [error, setError] = useState("")
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("./login")
      } else {
        const { user } = session
        setUserMetadata({
          email: user.user_metadata.email,
          phone: user.user_metadata.phone,
          full_name: user.user_metadata.full_name,
        })
        fetchTickets()
        subscribeToTickets()
      }
    }
    
    checkSession()

    return () => {
      supabase.removeAllChannels()
    }
  }, [router])

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from("Tickets")
      .select("*")
      .order("created_at", { ascending: false })
    
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

  const subscribeToTickets = () => {
    supabase
      .channel('Tickets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Tickets' }, (payload) => {
        setTickets(currentTickets => [payload.new, ...currentTickets])
      })
      .subscribe()
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (newTicket.createdFor === "customer" && !newTicket.email && !newTicket.phone) {
      setError("Please provide either an email or a phone number for the customer.")
      return
    }
    setError("")

    const ticketData = {
      TicketNavn: newTicket.ticketTitle,
      Navn: newTicket.createdFor === "self" ? userMetadata.full_name : newTicket.name,
      EnhedsOplysning: newTicket.deviceOrBrowser,
      Fejlkode: newTicket.errorCode,
      Beskrivelse: newTicket.description,
      Phone: newTicket.createdFor === "self" ? userMetadata.phone : newTicket.phone,
      Email: newTicket.createdFor === "self" ? userMetadata.email : newTicket.email,
    }

    const { data, error } = await supabase
      .from("Tickets")
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

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    if (newAccount.password !== newAccount.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setError("")


    // const { data, error } = await supabase.auth.signUp({
    //   email: newAccount.email,
    //   password: newAccount.password,
    //   phone: newAccount.phoneNumber,
    //   options: {
    //     data: {
    //       full_name: newAccount.displayName,
    //     }
    //   }
    // })

    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Account created",
        description: "New account has been successfully created.",
      })
      setNewAccount({
        email: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        phoneNumber: "",
      })
      setIsAlertOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Worker Dashboard</h1>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button className="mb-6">
            <UserPlus className="mr-2 h-4 w-4" />
            Create New Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Account</AlertDialogTitle>
            <AlertDialogDescription>
              Fill in the details to create a new worker account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newAccount.password}
                onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newAccount.confirmPassword}
                onChange={(e) => setNewAccount({ ...newAccount, confirmPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Full Name"
                value={newAccount.displayName}
                onChange={(e) => setNewAccount({ ...newAccount, displayName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={newAccount.phoneNumber}
                onChange={(e) => setNewAccount({ ...newAccount, phoneNumber: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Create Account</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
      
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
                <Label htmlFor="createdFor">Created for</Label>
                <Select
                  value={newTicket.createdFor}
                  onValueChange={(value) => {
                    setNewTicket({
                      ...newTicket,
                      createdFor: value,
                      name: value === "self" ? userMetadata.full_name : "",
                      email: value === "self" ? userMetadata.email : "",
                      phone: value === "self" ? userMetadata.phone : "",
                    })
                  }}
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
                  onChange={(e) => setNewTicket({ ...newTicket, ticketTitle: e.target.value })}
                />
              </div>
              {newTicket.createdFor === "customer" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    placeholder="Customer's name"
                    value={newTicket.name}
                    onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email {newTicket.createdFor === "customer" && "(Optional if phone is provided)"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={newTicket.email}
                  onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                  readOnly={newTicket.createdFor === "self"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone {newTicket.createdFor === "customer" && "(Optional if email is provided)"}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Example: +45 01 23 45 67"
                  value={newTicket.phone}
                  onChange={(e) => setNewTicket({ ...newTicket, phone: e.target.value })}
                  readOnly={newTicket.createdFor === "self"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceOrBrowser">Browser/Device</Label>
                <Input
                  id="deviceOrBrowser"
                  placeholder="Either device or browser"
                  value={newTicket.deviceOrBrowser}
                  onChange={(e) => setNewTicket({ ...newTicket, deviceOrBrowser: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="errorCode">Error Code (If provided)</Label>
                <Input
                  id="errorCode"
                  type="number"
                  placeholder="Example: 404"
                  value={newTicket.errorCode}
                  onChange={(e) => setNewTicket({ ...newTicket, errorCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Ticket Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
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
                      Created for: {ticket.Navn}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{ticket.Beskrivelse}</p>
                    <p className="text-xs mt-2">Device/Browser: {ticket.EnhedsOplysning}</p>
                    {ticket.Fejlkode && <p className="text-xs">Error Code: {ticket.Fejlkode}</p>}
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      Created at: {new  Date(ticket.created_at).toLocaleString()}
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