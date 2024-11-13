// TicketCard.js
'use client'

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Clock, Delete, Eye, File, Home, LineChart, ListFilter, MoreHorizontal, Package, Package2, PanelLeft, Pen, PlusCircle, Search, Settings, ShoppingCart, Trash, Trash2, Users2, View, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

// Import the priority mapping if using a separate utility file
// import { priorityMap } from "./PriorityUtils"

export default function TicketCard({ ticket, medarbejdere, fetchTickets, userMetadata }) {
  const { toast } = useToast()
  const [newNote, setNewNote] = useState("")
  const [ticketNotes, setTicketNotes] = useState([])

  useEffect(() => {
    fetchNotes()
  }, [ticket.id])

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("TicketNotes")
      .select("*, Medarbejdere:MedarbejderId (Fornavn, Efternavn)")
      .eq("TicketId", ticket.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error fetching notes",
        description: error.message,
        variant: "destructive",
    })
    } else {
      setTicketNotes(data)
    }
  }

  const handlePriorityChange = async (priority) => {
    const { error } = await supabase
      .from('Tickets')
      .update({ Priority: priority })
      .eq('id', ticket.id)

    if (error) {
      toast({
        title: "Error updating priority",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Priority updated",
        description: "Ticket priority has been updated successfully.",
      })
      fetchTickets()
    }
  }

  const handleStatusChange = async (status) => {
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
      .eq('id', ticket.id)

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

  const handleDeleteTicket = async () => {
    const { error } = await supabase
      .from('Tickets')
      .delete()
      .eq('id', ticket.id)

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

  const handleAssignWorker = async (workerId) => {
    const { error } = await supabase
      .from('Tickets')
      .update({ MedarbejderId: workerId })
      .eq('id', ticket.id)
  
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

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    console.log(userMetadata.id)

    const noteData = {
      TicketId: ticket.id,
      Note: newNote.trim(),
      MedarbejderId: userMetadata.id // Assuming userMetadata contains the current user's id
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
      setNewNote("")
      fetchNotes()
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
      fetchNotes()
    }
  }

  // Helper function to get priority details
  const getPriorityDetails = (priority) => {
    switch (priority) {
      case 1:
        return { label: "1 (High)", color: "red" };
      case 2:
        return { label: "2", color: "orange" };
      case 3:
        return { label: "3", color: "yellow" };
      case 4:
        return { label: "4 (Low)", color: "green" };
      default:
        return { label: "Unknown", color: "gray" };
    }
  };

  // Alternatively, if using priorityMap
  // const priority = priorityMap[ticket.Priority] || { label: "Unknown", color: "gray" };

  const priority = getPriorityDetails(ticket.Priority);

  return (
    <TableRow>
      <TableCell className="font-medium">{ticket.TicketNavn}</TableCell>
      <TableCell>
        {ticket.Done && (
          <Badge variant="secondary">
            Completed
          </Badge>
        )}
        {ticket.Ongoing && (
          <Badge variant="secondary">
            In Progress
          </Badge>
        )}
        {!ticket.Done && !ticket.Ongoing && (
          <Badge variant="secondary">
            Open
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={`${
                    priority.color === 'red' ? 'bg-red-500' :
                    priority.color === 'orange' ? 'bg-orange-500' :
                    priority.color === 'yellow' ? 'bg-yellow-500' :
                    priority.color === 'green' ? 'bg-green-500' :
                    'bg-gray-500'
                  } text-white`}>{priority.label}</Badge>
      </TableCell>
      <TableCell className="">{ticket.Fejlkode}</TableCell>
      <TableCell className="">
      <Select
            value={ticket.MedarbejderId || ""}
            onValueChange={(value) => handleAssignWorker(value)}
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
      </TableCell>
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
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-haspopup="true"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuItem><Eye/>View</DropdownMenuItem>
            <DropdownMenuItem><Trash/>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}