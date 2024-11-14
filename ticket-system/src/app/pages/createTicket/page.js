'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import CreateTicketForm from "@/components/dashboard/CreateTicketForm"
import Sidebar from "@/components/sidebar"

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [medarbejdere, setMedarbejdere] = useState([])
  const [userMetadata, setUserMetadata] = useState({})
  const [workerTicketCounts, setWorkerTicketCounts] = useState({})
  const [isUserMetadataLoaded, setIsUserMetadataLoaded] = useState(false) // New state to track when userMetadata is loaded

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
      console.log("User data from cookie:", userJson) // Log here to check structure
      setUserMetadata(userJson.data || {}) // Set userMetadata with data or fallback to an empty object
      setIsUserMetadataLoaded(true) // Set the flag to true once userMetadata is set
    } else {
      router.push("./login")
    }
  }

  // New useEffect to check if userMetadata is delayed
  useEffect(() => {
    if (isUserMetadataLoaded) {
      console.log("userMetadata after being set:", userMetadata)
    } else {
      console.log("userMetadata not set yet.")
    }
  }, [userMetadata, isUserMetadataLoaded]) // Triggered when userMetadata or isUserMetadataLoaded changes

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
    <div className="container mx-auto p-6 flex">
      <Sidebar 
        medarbejdere={medarbejdere}
        workerTicketCounts={workerTicketCounts}
        userMetadata={userMetadata}
        fetchMedarbejdere={fetchMedarbejdere}
        currentPage={"createTicket"}
      />
      <div className="flex-1 ml-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create a ticket</h1>
        </div>
        
        <div className="w-full max-w-3xl mx-auto">
          <CreateTicketForm 
            userMetadata={userMetadata} 
            medarbejdere={medarbejdere} 
            fetchTickets={fetchTickets}
          /> 
        </div>
      </div>
    </div>
  )
}
