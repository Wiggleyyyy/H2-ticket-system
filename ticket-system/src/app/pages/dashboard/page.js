// Dashboard.js
'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import { List, LogOut, Ticket, TicketCheck, TicketPercent, Tickets } from "lucide-react"
import Sidebar from "@/components/sidebar"

import Link from "next/link"
import { Activity, ArrowUpRight, CircleUser, CreditCard, DollarSign, Menu, Package2, Search, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MembersList from "@/components/dashboard/MembersList" //says error but there isnt one???

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
      console.log(userJson)
      console.log(userJson.data)
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
      .neq("Done", "True")
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

  const handleLogout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("./login")
  }

  return (
    <div className="container mx-auto p-4">
      <Sidebar/>
      <div className="flex justify-between items-center mb-6">
      </div>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tickets
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50</div>
              <p className="text-xs text-muted-foreground">
                +10 from the last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Workers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{medarbejdere.length}</div>
              <p className="text-xs text-muted-foreground">
                +3 from the last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
              <TicketPercent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">31</div>
              <p className="text-xs text-muted-foreground">
                Out of 50 tickets
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downtime</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1h 03m</div>
              <p className="text-xs text-muted-foreground">
                +57m since last week
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card
            className="xl:col-span-2" x-chunk="dashboard-01-chunk-4"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Tickets</CardTitle>
                <CardDescription>
                  Recent tickets from the ticket system.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/pages/tickets">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Error Code</TableHead>
                    <TableHead className="">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow>
                      <TableCell>
                        <div className="font-medium">{ticket.TicketNavn}</div>
                      </TableCell>
                      <TableCell className="">CRAZY</TableCell>
                      <TableCell className="">{ticket.Fejlkode}</TableCell>
                      <TableCell className="">
                        {new Date(ticket.created_at).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        }) + 
                        ' ' + 
                        new Date(ticket.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }
                    </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Workers</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              {medarbejdere.map((worker) => (
                <div className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>{worker.Fornavn.charAt(0)}{worker.Efternavn.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {worker.Fornavn} {worker.Efternavn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {worker.Mail}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{}</div>
                </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}