// components/Dashboard/Dashboard.js
"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MembersList from "@/components/dashboard/MembersList";
import TicketForm from "@/components/dashboard/TicketForm";
import TicketList from "@/components/dashboard/TicketList";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from "@/app/utils/supabase/client";
import { PlusCircle, Ticket, MoreVertical, CheckCircle2, Clock, XCircle, Trash2, MessageSquare, List, LogOut  } from "lucide-react"
import { MetadataBoundary } from "next/dist/lib/metadata/metadata-boundary";

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [medarbejdere, setMedarbejdere] = useState([]);
  const [userMetadata, setUserMetadata] = useState({});
  const [workerTicketCounts, setWorkerTicketCounts] = useState({});
  const [ticketNotes, setTicketNotes] = useState({})

  // Fetch data and handle login/logout
  useEffect(() => {
    const getUserFromCookie = () => {
      const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {});
  
      if (cookies.user) {
        try {
          const userData = JSON.parse(cookies.user);
          
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
          };

          setUserMetadata(metaData);
          

        } catch (error) {
          console.error("Failed to parse user cookie:", error);
          router.push("/pages/login");
        }
      } else {
        router.push("/pages/login");
      }
    };
  
    getUserFromCookie();
    fetchMedarbejdere();
    fetchTickets();
    fetchTicketNotes();
  }, [router]);
  
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

  const handleLogout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("./login");
  };

  const updateWorkerTicketCounts = () => {
    const counts = {}
    tickets.forEach(ticket => {
      if (ticket.MedarbejderId) {
        counts[ticket.MedarbejderId] = (counts[ticket.MedarbejderId] || 0) + 1
      }
    })
    setWorkerTicketCounts(counts)
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Worker Dashboard</h1>
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <List className="h-5 w-5" /> Members
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Members List</SheetTitle>
              </SheetHeader>
              <MembersList medarbejdere={medarbejdere} userMetadata={userMetadata} workerTicketCounts={workerTicketCounts} handleCreateUser={handleCreateUser}/>
              </SheetContent>
          </Sheet>
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-5 w-5" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ticket Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6" />
              Create New Ticket
            </CardTitle>
            <CardDescription>Fill in the details to create a new ticket.</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketForm userMetadata={userMetadata} onTicketCreated={fetchTickets} medarbejdere={medarbejdere}/>
          </CardContent>
        </Card>

        {/* Ticket List Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"> 
              <Ticket className="h-6 w-6" />
              Recent Tickets
            </CardTitle>
            <CardDescription>View and manage your recent tickets.</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketList tickets={tickets} medarbejdere={medarbejdere} ticketNotes={ticketNotes} userMetadata={userMetadata} fetchTicketNotes={fetchTicketNotes}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
