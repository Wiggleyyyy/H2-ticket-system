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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Ticket, List, MoreVertical, CheckCircle2, Clock, XCircle, Trash2, MessageSquare, LogOut } from "lucide-react"
import { supabase } from "@/app/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    MedarbejderId: "",
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
  const [newNotes, setNewNotes] = useState({})
  const [ticketNotes, setTicketNotes] = useState({})
  const [workerTicketCounts, setWorkerTicketCounts] = useState({})

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
    fetchTicketNotes()
    subscribeToTickets()
  
    return () => {
      supabase.removeAllChannels()
    }
  }, [router])
  
  useEffect(() => {
    console.log("User metadata updated:", userMetadata)
  }, [userMetadata])

  useEffect(() => {
    updateWorkerTicketCounts()
  }, [tickets, medarbejdere])
  
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

  const fetchTicketNotes = async () => {
    const { data, error } = await supabase
      .from("TicketNotes")
      .select("*")
      .order("created_at", { ascending: false })
  
    if (error) {
      toast({
        title: "Error fetching notes",
        description: error.message,
        variant: "destructive",
      })
    } else {
      const notesByTicket = data.reduce((acc, note) => {
        if (!acc[note.TicketId]) {
          acc[note.TicketId] = []
        }
        acc[note.TicketId].push(note)
        return acc
      }, {})
      setTicketNotes(notesByTicket)
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

  const updateWorkerTicketCounts = () => {
    const counts = {}
    tickets.forEach(ticket => {
      if (ticket.MedarbejderId) {
        counts[ticket.MedarbejderId] = (counts[ticket.MedarbejderId] || 0) + 1
      }
    })
    setWorkerTicketCounts(counts)
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
      MedarbejderId: newTicket.MedarbejderId,
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
      })
      fetchTickets()
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
      fetchTickets()
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    const { error } = await supabase
      .from('Tickets')
      .delete()
      .eq('id', ticketId)

    if (error) {
      toast({
        title: "Error deleting ticket",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Ticket deleted",
        description: "The ticket has been successfully deleted.",
      })
      fetchTickets()
    }
  }

  const handleAssignWorker = async (ticketId, workerId) => {
    const { error } = await supabase
      .from('Tickets')
      .update({ MedarbejderId: workerId })
      .eq('id', ticketId)
  
    if (error) {
      toast({
        title: "Error assigning worker",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Worker assigned",
        description: "The worker has been successfully assigned to the ticket.",
      })
      fetchTickets()
    }
  }

  const handleAddNote = async (ticketId) => {
    if (!newNotes[ticketId]?.trim()) return
  
    const noteData = {
      TicketId: ticketId,
      MedarbejderId: userMetadata.id,
      Note: newNotes[ticketId].trim()
    }
  
    const { error } = await supabase
      .from("TicketNotes")
      .insert([noteData])
  
    if (error) {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Note added",
        description: "Your note has been added successfully.",
      })
      setNewNotes(prev => ({ ...prev, [ticketId]: "" }))
      fetchTicketNotes()
    }
  }

  const handleDeleteNote = async (noteId) => {
    const { error } = await supabase
      .from("TicketNotes")
      .delete()
      .eq('id', noteId)

    if (error) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted.",
      })
      fetchTicketNotes()
    }
  }

  const handleLogout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("./login")
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Worker Dashboard</h1>
        <div className="flex items-center gap-4">
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
                      <CardHeader className="flex"> 
                        <div className="flex items-center">
                          <Avatar className="mr-2">
                            <AvatarImage src="" alt="@username" />
                            <AvatarFallback>{employee.Fornavn.charAt(0)}{employee.Efternavn.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{employee.Fornavn} {employee.Efternavn}</CardTitle>
                            <CardDescription>Department: {employee.Department}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <p className="font-bold mr-1">Email:</p>
                          <p> {employee.Mail}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold mr-1">Phone:</p>
                          <p>Phone: {employee.Phone}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold mr-1">Is Supporter:</p>
                          <p>{employee.IsSupporter ? "Yes" : "No"}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold mr-1">Is Admin:</p>
                          <p>{employee.IsAdmin ? "Yes" : "No"}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold mr-1">Is Developer:</p>
                          <p>{employee.IsDeveloper ? "Yes" : "No"}</p>
                        </div>
                        <div className="flex items-center">
                          <p className="font-bold mr-1">Assigned Tickets:</p>
                          <p>{workerTicketCounts[employee.id] || 0}</p>
                        </div>
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
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Recent Tickets
            </CardTitle>
            <CardDescription>View and manage your recent tickets.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[75dvh] pr-4">
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
                              {ticket.Done && (
                                <DropdownMenuItem onClick={() => handleDeleteTicket(ticket.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Ticket
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{ticket.Beskrivelse}</p>
                      <p className="text-xs mt-2">Device/Browser: {ticket.EnhedsOplysning}</p>
                      {ticket.Fejlkode && <p className="text-xs">Error Code: {ticket.Fejlkode}</p>}
                      <div className="mt-4">
                        <Label htmlFor={`worker-${ticket.id}`}>Assigned To</Label>
                        <Select
                          value={ticket.MedarbejderId || ""}
                          onValueChange={(value) => handleAssignWorker(ticket.id, value)}
                        >
                          <SelectTrigger id={`worker-${ticket.id}`}>
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
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <h3 className="text-sm font-semibold">Notes</h3>
                        </div>
                        
                        <div className="space-y-2">
                          {ticketNotes[ticket.id]?.map(note => {
                            const worker = medarbejdere.find(m => m.id === note.MedarbejderId)
                            return (
                              <div key={note.id} className="bg-muted p-3 rounded-lg space-y-1">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm">{note.Note}</p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="h-6 w-6"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete note</span>
                                  </Button>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                  <span>{worker ? `${worker.Fornavn} ${worker.Efternavn}` : 'Unknown Worker'}</span>
                                  <span>{new Date(note.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Add a note..."
                            value={newNotes[ticket.id] || ""}
                            onChange={(e) => setNewNotes(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                            className="min-h-[80px]"
                          />
                          <Button 
                            onClick={() => handleAddNote(ticket.id)}
                            className="shrink-0"
                          >
                            Add Note
                          </Button>
                        </div>
                      </div>

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