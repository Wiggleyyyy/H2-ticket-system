// CreateTicketForm.js
'use client'

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export default function CreateTicketForm({ userMetadata, medarbejdere, fetchTickets }) {
  const { toast } = useToast()
  const [newTicket, setNewTicket] = useState({
    ticketTitle: "",
    name: "",
    email: "",
    phone: "",
    description: "",
    errorCode: "",
    deviceOrBrowser: "",
    createdFor: "self",
    MedarbejderId: "",
    //Priority: 4,
  })
  const [error, setError] = useState("")

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (newTicket.createdFor === "customer" && !newTicket.email && !newTicket.phone) {
      setError("Please provide either an email or a phone number for the customer.")
      return
    }
    setError("")

    const ticketData = {
      TicketNavn: newTicket.ticketTitle,
      Navn: newTicket.name,
      EnhedsOplysning: newTicket.deviceOrBrowser,
      Fejlkode: newTicket.errorCode,
      Beskrivelse: newTicket.description,
      Phone: newTicket.phone,
      Email: newTicket.email,
      Done: false,
      Ongoing: false,
      MedarbejderId: newTicket.MedarbejderId,
      //Priority: newTicket.Priority
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
        MedarbejderId: "",
        //Priority: 4,
      })
      fetchTickets()
    }
  }

  return (
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
                if (value === "self") {
                  setNewTicket(prevState => ({
                    ...prevState,
                    createdFor: value,
                    name: `${userMetadata.Fornavn} ${userMetadata.Efternavn}`,
                    email: userMetadata.Mail,
                    phone: userMetadata.Phone,
                  }))
                } else {
                  setNewTicket(prevState => ({
                    ...prevState,
                    createdFor: value,
                    name: "",
                    email: "",
                    phone: "",
                  }))
                }
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
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Name"
              value={newTicket.name}
              onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
              readOnly={newTicket.createdFor === "self"}
            />
          </div>
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
          
          {/* <div>
          <Select 
            value={newTicket.Priority} 
            onValueChange={(value) => setNewTicket({ ...newTicket, Priority: parseInt(value, 10) })}
          >
            Priority 4 (low) 1 (high)
            <SelectTrigger className="space-y-2">
              <SelectValue placeholder="4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select
              value={newTicket.MedarbejderId}
              onValueChange={(value) => setNewTicket({ ...newTicket, MedarbejderId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a worker" />
              </SelectTrigger>
              <SelectContent>
                {medarbejdere.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.Fornavn} {worker.Efternavn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full">Create Ticket</Button>
        </form>
      </CardContent>
    </Card>
  )
}