// Dashboard.js
'use client'
import Image from 'next/image';
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import CreateTicketForm from "@/components/dashboard/CreateTicketForm"
import TicketList from "@/components/dashboard/TicketList"
import MembersList from "@/components/dashboard/MembersList" //says error but there isnt one???
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import { ChevronLeft, Home, LineChart, Package, Package2, PanelLeft, PlusCircle, Search, Settings, ShoppingCart, Trash2, Upload, Users2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [medarbejdere, setMedarbejdere] = useState([])
  const [userMetadata, setUserMetadata] = useState({})
  const [workerTicketCounts, setWorkerTicketCounts] = useState({})

  useEffect(() => {
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
    updateWorkerTicketCounts()
  }, [tickets, medarbejdere])

  const getUserFromCookie = () => {
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))
    if (userCookie) {
      const userJson = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
      setUserMetadata(userJson.data)
    } else {
      router.push("./login")
    }
  }

  const fetchMedarbejdere = async () => {
    const { data, error } = await supabase
      .from('Medarbejdere')
      .select('*')

    if (error) {
      toast({
        title: "Error fetching employees",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setMedarbejdere(data)
    }
  }

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('Tickets')
      .select("*")
      .order("Priority", { ascending: true }) 
      .order("created_at", { ascending: false });

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
      .from('TicketNotes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: "Error fetching ticket notes",
        description: error.message,
        variant: "destructive",
      })
    } else {
      // You might want to update the state with the notes or pass them to the TicketList component
      // For now, we'll just log them
      console.log("Ticket notes:", data)
    }
  }

  const subscribeToTickets = () => {
    const ticketsChannel = supabase
      .channel('tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Tickets' }, fetchTickets)
      .subscribe()

    return () => {
      supabase.removeChannel(ticketsChannel)
    }
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

  return (
    <div className="ml-16 mx-auto p-4">
      <Sidebar
        medarbejdere={medarbejdere}
        workerTicketCounts={workerTicketCounts}
        userMetadata={userMetadata}
        fetchMedarbejdere={fetchMedarbejdere}
      />
      <div className="gap-6 mt-16">
      <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <a href='/pages/tickets'><ChevronLeft className="h-4 w-4" /></a>
                <span className="sr-only"><a href='/pages/tickets'>Back</a></span>
              </Button>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Tikcet Title
              </h1>
              <Badge variant="outline" className="ml-auto sm:ml-0 bg-red-500">
                Priority: 1 (High)
              </Badge>
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="sm">
                  Delete
                </Button>
                <Button size="sm">Save Ticket</Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader>
                    <CardTitle>Ticket Details</CardTitle>
                    <CardDescription>
                      Created for <span className="font-bold">Noah House</span> at <span className='font-bold'>13/11/2024 01:43 PM</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Device/Browser</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          defaultValue="Firefox"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="name">Error Code</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          defaultValue="404"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="name">Assigned To</Label>
                        <Select>
                          <SelectTrigger className="">
                            <SelectValue placeholder="Noah House" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="apple">Noah House</SelectItem>
                              <SelectItem value="banana">Martin Vad Hansen</SelectItem>
                              <SelectItem value="blueberry">David House</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card x-chunk="dashboard-07-chunk-1">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                    <CardDescription>
                      Notes regarding this ticket
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="bg-muted p-3 rounded-lg space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm">This is a crazy note!</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete note</span>
                      </Button>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Created at <span className='font-bold'>13/11/2024 - 12:50 PM</span></span>
                      <p>Noah House</p>
                    </div>
                  </div>
                  </CardContent>
                  <CardFooter className="justify-center border-t p-4">
                    <Textarea
                      placeholder="Add a note..."
                      className="min-h-[80px]"
                    />
                    <Button size="sm" className="gap-1 ml-3 shrink-0 min-h-[80px]">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Note
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-3">
                  <CardHeader>
                    <CardTitle>Ticket Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="status">Status</Label>
                        <Select>
                          <SelectTrigger id="status" aria-label="Select status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="progress">In Progress</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="status">Priority</Label>
                        <Select>
                          <SelectTrigger id="status" aria-label="Select status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 (Low)</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="1">1 (High)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Button variant="outline" size="sm">
                Delete Ticket
              </Button>
              <Button size="sm">Save</Button>
            </div>
          </div>
      </div>
    </div>
  )
}