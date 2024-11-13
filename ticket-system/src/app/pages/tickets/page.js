// Dashboard.js
'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import CreateTicketForm from "@/components/dashboard/CreateTicketForm"
import TicketList from "@/components/dashboard/TicketList"
import MembersList from "@/components/dashboard/MembersList" //says error but there isnt one???
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { List, LogOut } from "lucide-react"
import Sidebar from "@/components/sidebar"

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
        <h1 className="text-2xl font-bold">Tickets</h1>
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Members
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Members List</SheetTitle>
                <SheetDescription>List of all employees in Medarbejdere</SheetDescription>
              </SheetHeader>
              <MembersList 
                medarbejdere={medarbejdere} 
                workerTicketCounts={workerTicketCounts} 
                userMetadata={userMetadata}
                fetchMedarbejdere={fetchMedarbejdere}
              />
            </SheetContent>
          </Sheet>
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <TicketList 
          tickets={tickets} 
          medarbejdere={medarbejdere} 
          fetchTickets={fetchTickets}
          fetchTicketNotes={fetchTicketNotes}
          userMetadata={userMetadata} // Add this line
        />
      </div>
    </div>
  )
}