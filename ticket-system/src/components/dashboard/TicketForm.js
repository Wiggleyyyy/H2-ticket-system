// components/Dashboard/TicketForm.js
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast"; // Assuming toast is imported here

export default function TicketForm({ userMetadata, onTicketCreated }) {
  const [error, setError] = useState("");
  const [newTicket, setNewTicket] = useState({
    ticketTitle: "",
    name: `${userMetadata.Fornavn} ${userMetadata.Efternavn}`,
    email: userMetadata.Mail,
    phone: userMetadata.Phone,
    description: "",
    errorCode: "",
    deviceOrBrowser: "",
    createdFor: "self",
    MedarbejderId: "",
  });

  // Update name, email, and phone with userMetadata when "self" is selected
  useEffect(() => {
    if (newTicket.createdFor === "self") {
      setNewTicket((prevState) => ({
        ...prevState,
        name: `${userMetadata.Fornavn} ${userMetadata.Efternavn}`,
        email: userMetadata.Mail,
        phone: userMetadata.Phone,
      }));
    } else if (newTicket.createdFor === "customer") {
      setNewTicket((prevState) => ({
        ...prevState,
        name: "",
        email: "",
        phone: "",
      }));
    }
  }, [newTicket.createdFor, userMetadata]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (newTicket.createdFor === "customer" && !newTicket.email && !newTicket.phone) {
      setError("Please provide either an email or a phone number for the customer.");
      return;
    }
    setError("");

    const ticketData = {
      TicketNavn: newTicket.ticketTitle,
      Navn: newTicket.name,
      EnhedsOplysning: newTicket.deviceOrBrowser,
      Fejlkode: newTicket.errorCode,
      Beskrivelse: newTicket.description,
      Phone: newTicket.phone,
      Email: newTicket.email,
      Done: false,
      Ongoing: false,
      MedarbejderId: newTicket.MedarbejderId,
    };

    const { data, error } = await supabase
      .from("Tickets")
      .insert([ticketData])
      .select();

    if (error) {
      toast({
        title: "Error creating ticket",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ticket created",
        description: "Your ticket has been successfully created.",
      });
      setNewTicket({
        ticketTitle: "",
        name: `${userMetadata.Fornavn} ${userMetadata.Efternavn}`,
        email: userMetadata.Mail,
        phone: userMetadata.Phone,
        description: "",
        errorCode: "",
        deviceOrBrowser: "",
        createdFor: "self",
        MedarbejderId: "",
      });
      onTicketCreated();
    }
  };

  return (
    <form onSubmit={handleCreateTicket} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="createdFor">Created for</Label>
        <Select
          value={newTicket.createdFor}
          onValueChange={(value) => setNewTicket((prevState) => ({ ...prevState, createdFor: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select who it's for" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="self">Self</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ticketTitle">Ticket Title</Label>
        <Input
          id="ticketTitle"
          placeholder="Title of ticket"
          value={newTicket.ticketTitle}
          onChange={(e) => setNewTicket({ ...newTicket, ticketTitle: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Name"
          value={newTicket.name}
          onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email {newTicket.createdFor === "customer" && "(Optional if phone is provided)"}</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email address"
          value={newTicket.email}
          onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone {newTicket.createdFor === "customer" && "(Optional if email is provided)"}</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Example: +45 01 23 45 67"
          value={newTicket.phone}
          onChange={(e) => setNewTicket({ ...newTicket, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deviceOrBrowser">Browser/Device</Label>
        <Input
          id="deviceOrBrowser"
          placeholder="Either device or browser"
          value={newTicket.deviceOrBrowser}
          onChange={(e) => setNewTicket({ ...newTicket, deviceOrBrowser: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="errorCode">Error Code (If provided)</Label>
        <Input
          id="errorCode"
          type="number"
          placeholder="Example: 404"
          value={newTicket.errorCode}
          onChange={(e) => setNewTicket({ ...newTicket, errorCode: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Ticket Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the issue..."
          value={newTicket.description}
          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full">Create Ticket</Button>
    </form>
  );
}