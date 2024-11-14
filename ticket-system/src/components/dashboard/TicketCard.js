'use client';

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TableRow, TableCell } from "@/components/ui/table";
import { MoreHorizontal, Eye, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useRouter } from "next/navigation";

export default function TicketCard({ ticket, medarbejdere, fetchTickets, userMetadata }) {
  const router = useRouter();
  const { toast } = useToast();
  const [ticketNotes, setTicketNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (ticket.id) fetchNotes();
  }, [ticket.id]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("TicketNotes")
      .select("*, Medarbejdere:MedarbejderId (Fornavn, Efternavn)")
      .eq("TicketId", ticket.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching notes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTicketNotes(data);
    }
  };

  const handleViewTicket = () => {
    router.push(`./ticket/${ticket.id}`);
  };

  const handleDeleteTicket = async () => {
    const { error } = await supabase
      .from('Tickets')
      .delete()
      .eq('id', ticket.id);

    if (error) {
      toast({
        title: "Error deleting ticket",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ticket deleted",
        description: "The ticket has been successfully deleted.",
      });
      fetchTickets();
    }
  };

  const handleAssignWorker = async (workerId) => {
    const { error } = await supabase
      .from('Tickets')
      .update({ MedarbejderId: workerId })
      .eq('id', ticket.id);

    if (error) {
      toast({
        title: "Error assigning worker",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Worker assigned",
        description: "The worker has been successfully assigned to the ticket.",
      });
      fetchTickets();
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{ticket.TicketNavn}</TableCell>
      <TableCell>
        {ticket.Done ? (
          <Badge variant="secondary">Completed</Badge>
        ) : ticket.Ongoing ? (
          <Badge variant="secondary">In Progress</Badge>
        ) : (
          <Badge variant="secondary">Open</Badge>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={`${
          ticket.Priority === 1 ? 'bg-red-500' :
          ticket.Priority === 2 ? 'bg-orange-500' :
          ticket.Priority === 3 ? 'bg-yellow-500' :
          'bg-green-500'
        } text-white`}>
          {ticket.Priority} (Priority)
        </Badge>
      </TableCell>
      <TableCell>{ticket.Fejlkode || "N/A"}</TableCell>
      <TableCell>
        <Select
          value={ticket.MedarbejderId || ""}
          onValueChange={(value) => handleAssignWorker(value)}
        >
          <SelectTrigger>
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
      <TableCell>
        {new Date(ticket.created_at).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })}{" "}
        {new Date(ticket.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewTicket}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteTicket}>
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
