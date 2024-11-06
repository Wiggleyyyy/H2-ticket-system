'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import bcrypt from "bcryptjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Ticket, List, MoreVertical, CheckCircle2, Clock, XCircle } from "lucide-react"
import { supabase } from "@/app/utils/supabase/client"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [medarbejdere, setMedarbejdere] = useState([])
  const [userMetadata, setUserMetadata] = useState({})
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
  const [newUser, setNewUser] = useState({
    Fornavn: "",
    Efternavn: "",
    Department: "",
    Mail: "",
    Phone: "",
    IsSupporter: false,
    IsAdmin: false,
    IsDeveloper: false,
    HashedPassword: "",
  })
  const [error, setError] = useState("")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)

  useEffect(() => {
    const getUserFromCookie = () => {
      const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=")
        acc[key] = decodeURIComponent(value)
        return acc
      }, {})
  
      if (cookies.user) {
        try {
          const userData = JSON.parse(cookies.user)
          console.log("Parsed user data from cookie:", userData)
  
          const metaData = {
            id: userData.data.id || null,
            Fornavn: userData.data.Fornavn || "",
            Efternavn: userData.data.Efternavn || "",
            Department: userData.data.Department || "",
            Mail: userData.data.Mail || "",
            Phone: userData.data.Phone || "",
            IsSupporter: userData.data.IsSupporter || false,
            IsAdmin: userData.data.IsAdmin || false,
            IsDeveloper: userData.data.IsDeveloper || false,
            HashedPassword: userData.data.HashedPassword || ""
          }
          
          setUserMetadata(metaData)
          
          // Initialize newTicket with user data
          setNewTicket(prevState => ({
            ...prevState,
            name: `${metaData.Fornavn} ${metaData.Efternavn}`,
            email: metaData.Mail,
            phone: metaData.Phone,
          }))
        } catch (error) {
          console.error("Failed to parse user cookie:", error)
          router.push("./login")
        }
      } else {
        console.warn("No 'user' cookie found; redirecting to login.")
        router.push("./login")
      }
    }
  
    getUserFromCookie()
    fetchMedarbejdere()
    fetchTickets()
    subscribeToTickets()
  
    return () => {
      supabase.removeAllChannels()
    }
  }, [router])
  
  useEffect(() => {
    console.log("User metadata updated:", userMetadata)
  }, [userMetadata])
  
  const fetchMedarbejdere = async () => {
    const { data, error } = await supabase
      .from("Medarbejdere")
      .select("*")
    
    if (error) {
      toast({
        title: "Error fetching members",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setMedarbejdere(data)
    }
  }

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
      Navn: newTicket.name,
      EnhedsOplysning: newTicket.deviceOrBrowser,
      Fejlkode: newTicket.errorCode,
      Beskrivelse: newTicket.description,
      Phone: newTicket.phone,
      Email: newTicket.email,
      Done: false,
      Ongoing: false,
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

  const handleCreateUser = async () => {
    const hashedPassword = await bcrypt.hash(newUser.HashedPassword, 10)
    
    console.log(hashedPassword)

    const userToSave = {
      ...newUser,
      HashedPassword: hashedPassword,
    }

    const { data, error } = await supabase
      .from("Medarbejdere")
      .insert([userToSave])
      .select()

    if (error) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "User created",
        description: "New user has been successfully created.",
      })
      setNewUser({
        Fornavn: "",
        Efternavn: "",
        Department: "",
        Mail: "",
        Phone: "",
        IsSupporter: false,
        IsAdmin: false,
        IsDeveloper: false,
        HashedPassword: "",
      })
      setIsCreateUserOpen(false)
      fetchMedarbejdere()
    }
  }

  const handleStatusChange = async (ticketId, status) => {
    const updates = {}
    if (status === 'ongoing') {
      updates.Ongoing = true
      updates.Done = false
    } else if (status === 'done') {
      updates.Done = true
      updates.Ongoing = false
    } else {
      updates.Done = false
      updates.Ongoing = false
    }

    const { error } = await supabase
      .from('Tickets')
      .update(updates)
      .eq('id', ticketId)

    if (error) {
      toast({
        title: "Error updating ticket status",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Status updated",
        description: "Ticket status has been updated successfully.",
      })
      fetchTickets() // Refresh tickets after update
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Worker Dashboard</h1>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Members
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Members List</SheetTitle>
              <SheetDescription>List of all employees in Medarbejdere</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
              <div className="space-y-4">
                {medarbejdere.map((employee) => (
                  <Card key={employee.id}>
                    <CardHeader>
                      <CardTitle>{employee.Fornavn} {employee.Efternavn}</CardTitle>
                      <CardDescription>Department: {employee.Department}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Email: {employee.Mail}</p>
                      <p>Phone: {employee.Phone}</p>
                      <p>Is Supporter: {employee.IsSupporter ? "Yes" : "No"}</p>
                      <p>Is Admin: {employee.IsAdmin ? "Yes" : "No"}</p>
                      <p>Is Developer: {employee.IsDeveloper ? "Yes" : "No"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            {(userMetadata.IsAdmin || userMetadata.IsDeveloper) && (
              <div className="mt-4">
                <AlertDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" className="w-full mt-4">Create User</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Create New User</AlertDialogTitle>
                      <AlertDialogDescription>Fill in the details to create a new employee.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="First Name"
                        value={newUser.Fornavn}
                        onChange={(e) => setNewUser({ ...newUser, Fornavn: e.target.value })}
                      />
                      <Input
                        placeholder="Last Name"
                        value={newUser.Efternavn}
                        onChange={(e) => setNewUser({ ...newUser, Efternavn: e.target.value })}
                      />
                      <Input
                        placeholder="Department"
                        value={newUser.Department}
                        onChange={(e) => setNewUser({ ...newUser, Department: e.target.value })}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newUser.Mail}
                        onChange={(e) => setNewUser({ ...newUser, Mail: e.target.value })}
                      />
                      <Input
                        placeholder="Phone"
                        type="tel"
                        value={newUser.Phone}
                        onChange={(e) => setNewUser({ ...newUser, Phone: e.target.value })}
                      />
                      <Input
                        placeholder="Password"
                        type="password"
                        value={newUser.HashedPassword}
                        onChange={(e) => setNewUser({ ...newUser, HashedPassword: e.target.value })}
                      />
                      <div className="flex gap-4">
                        <Label>
                          <Input
                            type="checkbox"
                            checked={newUser.IsSupporter}
                            onChange={(e) => setNewUser({ ...newUser, IsSupporter: e.target.checked })}
                          /> Supporter
                        </Label>
                        <Label>
                          <Input
                            type="checkbox"
                            checked={newUser.IsAdmin}
                            onChange={(e) => setNewUser({ ...newUser, IsAdmin: e.target.checked })}
                          /> Admin
                        </Label>
                        <Label>
                          <Input
                            type="checkbox"
                            checked={newUser.IsDeveloper}
                            onChange={(e) => setNewUser({ ...newUser, IsDeveloper: e.target.checked })}
                          /> Developer
                        </Label>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCreateUser}>Create User</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
      
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
            <ScrollArea className="h-[90dvh] pr-4">
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{ticket.TicketNavn}</CardTitle>
                          <CardDescription>
                            Created for: {ticket.Navn}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {ticket.Done && (
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {ticket.Ongoing && (
                            <Badge variant="secondary" className="bg-yellow-500 text-white">
                              <Clock className="w-4 h-4 mr-1" />
                              In Progress
                            </Badge>
                          )}
                          {!ticket.Done && !ticket.Ongoing && (
                            <Badge variant="secondary">
                              <XCircle className="w-4 h-4 mr-1" />
                              Open
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'open')}>
                                Mark as Open
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'ongoing')}>
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'done')}>
                                Mark as Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
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
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}