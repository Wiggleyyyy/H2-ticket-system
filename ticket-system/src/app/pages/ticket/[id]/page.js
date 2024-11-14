'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import { ChevronLeft, PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Ticket({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [ticket, setTicket] = useState(null);
  const [medarbejdere, setMedarbejdere] = useState([]);
  const [userMetadata, setUserMetadata] = useState({});
  const [workerTicketCounts, setWorkerTicketCounts] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  // Extract the ticket ID from params
  const ticketId = params?.id;

  useEffect(() => {
    // Ensure ticketId is available before making any requests
    if (ticketId) {
      getUserFromCookie();
      fetchTicket();
      fetchMedarbejdere();
      fetchTicketNotes();
    }
  }, [ticketId]);

  const getUserFromCookie = () => {
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
    if (userCookie) {
      const userJson = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
      setUserMetadata(userJson.data);
    } else {
      router.push("/login");
    }
  };

  const fetchTicket = async () => {
    const { data, error } = await supabase
      .from('Tickets')
      .select("*")
      .eq('id', ticketId)
      .single();

    if (error) {
      toast({
        title: "Error fetching ticket",
        description: error.message,
        variant: "destructive",
      });
      router.push("/tickets");
    } else if (!data) {
      toast({
        title: "Ticket not found",
        description: "The requested ticket does not exist.",
        variant: "destructive",
      });
      router.push("/tickets");
    } else {
      setTicket(data);
    }
  };

  const fetchMedarbejdere = async () => {
    const { data, error } = await supabase
      .from('Medarbejdere')
      .select('*');

    if (error) {
      toast({
        title: "Error fetching employees",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMedarbejdere(data);
    }
  };

  const fetchTicketNotes = async () => {
    const { data, error } = await supabase
      .from('TicketNotes')
      .select('*')
      .eq('TicketId', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching ticket notes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotes(data);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const { data, error } = await supabase
      .from('TicketNotes')
      .insert([{ TicketId: ticketId, Note: newNote.trim(), MedarbejderId: userMetadata.id }]);

    if (error) {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Note added",
        description: "Your note has been added successfully.",
      });
      setNewNote("");
      fetchTicketNotes();
    }
  };

  const handleDeleteNote = async (noteId) => {
    const { error } = await supabase
      .from('TicketNotes')
      .delete()
      .eq('id', noteId);

    if (error) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted.",
      });
      fetchTicketNotes();
    }
  };

  const handleUpdateTicket = async (updates) => {
    const { error } = await supabase
      .from('Tickets')
      .update(updates)
      .eq('id', ticketId);

    if (error) {
      toast({
        title: "Error updating ticket",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ticket updated",
        description: "The ticket has been successfully updated.",
      });
      fetchTicket();
    }
  };

  if (!ticket) return null;

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
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.push('/tickets')}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              {ticket.TicketNavn}
            </h1>
            <Badge variant="outline" className={`ml-auto sm:ml-0 ${ticket.Priority === 1 ? 'bg-red-500' : ticket.Priority === 2 ? 'bg-orange-500' : ticket.Priority === 3 ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
              Priority: {ticket.Priority} {ticket.Priority === 1 ? '(High)' : ticket.Priority === 4 ? '(Low)' : ''}
            </Badge>
            <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button variant="outline" size="sm" onClick={() => handleUpdateTicket({ Deleted: true })}>Delete</Button>
              <Button size="sm" onClick={() => handleUpdateTicket(ticket)}>Save Ticket</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Details</CardTitle>
                  <CardDescription>
                    Created at <span className='font-bold'>{new Date(ticket.created_at).toLocaleString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                  <div className="grid gap-3">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        type="text"
                        className="w-full"
                        value={ticket.Beskrivelse || ''}
                        readOnly
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="device">Device/Browser</Label>
                      <Input
                        id="device"
                        type="text"
                        className="w-full"
                        value={ticket.Device || ''}
                        onChange={(e) => setTicket({...ticket, Device: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="errorCode">Error Code</Label>
                      <Input
                        id="errorCode"
                        type="text"
                        className="w-full"
                        value={ticket.Fejlkode || ''}
                        onChange={(e) => setTicket({...ticket, Fejlkode: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Select value={ticket.MedarbejderId || ''} onValueChange={(value) => setTicket({...ticket, MedarbejderId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a worker" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {medarbejdere.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id}>
                                {worker.Fornavn} {worker.Efternavn}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Notes regarding this ticket
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notes.map((note) => (
                    <div key={note.id} className="bg-muted p-3 rounded-lg space-y-1 mb-3">
                      <div className="flex justify-between items-start">
                        <p className="text-sm">{note.Note}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete note</span>
                        </Button>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Created at <span className='font-bold'>{new Date(note.created_at).toLocaleString()}</span></span>
                        <p>{medarbejdere.find(m => m.id === note.MedarbejderId)?.Fornavn || 'Unknown'} {medarbejdere.find(m => m.id === note.MedarbejderId)?.Efternavn || ''}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="justify-center border-t p-4">
                  <Textarea
                    placeholder="Add a note..."
                    className="min-h-[80px]"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button size="sm" className="gap-1 ml-3 shrink-0 min-h-[80px]" onClick={handleAddNote}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Note
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={ticket.Done ? 'completed' : (ticket.Ongoing ? 'progress' : 'open')}
                        onValueChange={(value) => {
                          const updates = {
                            Done: value === 'completed',
                            Ongoing: value === 'progress'
                          }
                          handleUpdateTicket(updates)
                        }}
                      >
                        <SelectTrigger id="status">
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
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={ticket.Priority.toString()}
                        onValueChange={(value) => handleUpdateTicket({ Priority: parseInt(value) })}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
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
            <Button variant="outline" size="sm" onClick={() => handleUpdateTicket({ Deleted: true })}>
              Delete Ticket
            </Button>
            <Button size="sm" onClick={() => handleUpdateTicket(ticket)}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
