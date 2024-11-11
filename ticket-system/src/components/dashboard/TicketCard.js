// TicketCard.js
'use client'

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, XCircle, Trash2, MessageSquare, MoreVertical } from "lucide-react"

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
      .select("*")
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

  return (
    <Card>
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
                <DropdownMenuItem onClick={() => handleStatusChange('open')}>
                  Mark as Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('ongoing')}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('done')}>
                  Mark as Completed
                </DropdownMenuItem>
                {ticket.Done && (
                  <DropdownMenuItem onClick={handleDeleteTicket}>
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
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Notes</h3>
          </div>
          
          <div className="space-y-2">
            {ticketNotes.map(note => (
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
                  <span>{new Date(note.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              onClick={handleAddNote}
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
  )
}