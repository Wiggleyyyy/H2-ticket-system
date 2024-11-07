"use client";

import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import TicketCard from "./TicketCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/app/utils/supabase/client";

export default function TicketList({ tickets, medarbejdere, ticketNotes, userMetadata, fetchTicketNotes, handleAssignWorker, handleStatusChange }) {
  const [newNotes, setNewNotes] = useState({});
  const { toast } = useToast();

  const handleDeleteNote = async (noteId) => {
    const { error } = await supabase.from("TicketNotes").delete().eq("id", noteId);

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
      fetchTicketNotes(); // Refresh notes to remove the deleted note
    }
  };

  const handleAddNote = async (ticketId) => {
    if (!newNotes[ticketId]?.trim()) return;

    const noteData = {
      TicketId: ticketId,
      MedarbejderId: userMetadata.id,
      Note: newNotes[ticketId].trim(),
    };

    const { error } = await supabase.from("TicketNotes").insert([noteData]);

    if (error) {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Note added",
        description: "Your note has been successfully added.",
      });
      setNewNotes((prev) => ({ ...prev, [ticketId]: "" })); // Clear the input field for the note
      fetchTicketNotes(); // Refresh notes to include the newly added note
    }
  };

  return (
    <ScrollArea className="h-[75dvh] pr-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          medarbejdere={medarbejdere}
          ticketNotes={ticketNotes}
          userMetadata={userMetadata}
          handleAddNote={handleAddNote}
          handleDeleteNote={handleDeleteNote}
          newNotes={newNotes}
          setNewNotes={setNewNotes}
          handleAssignWorker={handleAssignWorker}
          handleStatusChange={handleStatusChange}
        />
      ))}
    </ScrollArea>
  );
}
