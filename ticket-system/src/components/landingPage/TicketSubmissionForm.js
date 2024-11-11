// components/TicketSubmissionForm.js
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function TicketSubmissionForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [deviceOrBrowser, setDeviceOrBrowser] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email && !phone) {
      setError("Please provide either an email or a phone number.");
      return;
    }
    setError("");

    onSubmit({
      TicketNavn: ticketTitle,
      Navn: name,
      EnhedsOplysning: deviceOrBrowser,
      Fejlkode: errorCode,
      Beskrivelse: description,
      Phone: phone,
      Email: email,
    });

    // Reset form fields
    setName("");
    setEmail("");
    setPhone("");
    setDescription("");
    setErrorCode("");
    setDeviceOrBrowser("");
    setTicketTitle("");
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Submit a Ticket</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ticketTitle">Ticket Title</Label>
          <Input
            id="ticketTitle"
            placeholder="Title of ticket"
            value={ticketTitle}
            onChange={(e) => setTicketTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deviceOrBrowser">Browser/Device</Label>
          <Input
            id="deviceOrBrowser"
            placeholder="Either device or browser"
            value={deviceOrBrowser}
            onChange={(e) => setDeviceOrBrowser(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional if phone is provided)</Label>
          <Input
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional if email is provided)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Example: +45 01 23 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="errorCode">Error Code (If provided)</Label>
          <Input
            id="errorCode"
            type="number"
            placeholder="Example: 404"
            value={errorCode}
            onChange={(e) => setErrorCode(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Ticket Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full">Submit Ticket</Button>
      </form>
    </div>
  )
}