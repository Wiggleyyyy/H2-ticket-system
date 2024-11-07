"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { MoreVertical, CheckCircle2, Clock, XCircle, Trash2, MessageSquare } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TicketCard({ ticket, medarbejdere, ticketNotes, userMetadata, handleAddNote, handleDeleteNote, newNotes, setNewNotes, handleAssignWorker, handleStatusChange }) {
  const handleNoteChange = (ticketId, value) => {
    setNewNotes((prev) => ({ ...prev, [ticketId]: value }));
  };

  return (
    <Card className="my-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{ticket.TicketNavn}</CardTitle>
            <CardDescription>Created for: {ticket.Navn}</CardDescription>
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
            {ticketNotes[ticket.id]?.map((note) => {
              const worker = medarbejdere.find((m) => m.id === note.MedarbejderId);
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
              );
            })}
          </div>
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Add a note..."
              value={newNotes[ticket.id] || ""}
              onChange={(e) => handleNoteChange(ticket.id, e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={() => handleAddNote(ticket.id)} className="shrink-0">
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
  );
}
