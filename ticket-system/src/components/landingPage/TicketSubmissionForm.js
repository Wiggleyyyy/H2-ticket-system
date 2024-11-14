// components/TicketSubmissionForm.js
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TicketSubmissionForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [deviceOrBrowser, setDeviceOrBrowser] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");
  const [isSlaAccepted, setIsSlaAccepted] = useState(false);

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
        <div className="items-top flex space-x-2">
          <Checkbox
            id="terms1"
            checked={isSlaAccepted}
            onCheckedChange={(checked) => setIsSlaAccepted(checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms1"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept Service Level Agreement
            </label>
            <p className="text-sm text-muted-foreground">
              You agree to our Service Level Agreement. Read our SLA{" "}
              <Dialog>
                <DialogTrigger asChild>
                  <span className="text-blue-500 underline cursor-pointer">here</span>
                </DialogTrigger>
                <DialogContent className="max-w-lg h-[70vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Service Level Agreement (SLA)</DialogTitle>
                    <DialogDescription className="space-y-4 text-sm">
                      <p><strong>Mellem [Firmaets Navn] og Kunden</strong></p>
                      <p><strong>1. Formål</strong><br />
                      Formålet med denne SLA er at definere niveauet for de it-supporttjenester, som [Firmaets Navn] vil levere til Kunden. Aftalen beskriver servicemål og forventninger til håndtering af incident tickets.</p>
                      <p><strong>2. Supporttyper</strong><br />
                      [Firmaets Navn] tilbyder tre supportniveauer:<br />
                      • <strong>Level 1 (Basis Support)</strong>: Førstelinjesupport for almindelige brugerspørgsmål og simple tekniske problemer.<br />
                      • <strong>Level 2 (Avanceret Support)</strong>: Håndtering af mere komplekse tekniske problemer, der kræver dybere viden og fejlsøgning.<br />
                      • <strong>Level 3 (Specialiseret Support)</strong>: Teknisk specialekspertise, som kræver detaljeret viden og ofte inddragelse af eksterne specialister eller systemleverandører.</p>
                      <p><strong>3. Incident Management</strong><br />
                      Incident management omfatter følgende:<br />
                      • <strong>Incident Definition</strong>: Et "incident" refererer til enhver uplanlagt afbrydelse af en tjeneste, eller et reduceret serviceniveau.</p>
                      <p><strong>4. Servicemål og Tider</strong><br />
                      Prioritet, Respons Tid, Løsningstid (SLA), Eksempler:</p>
                      <ul>
                        <li><strong>Kritisk (P1)</strong>: 1 time respons, 4 timer løsningstid, eksempel: Totalt systemnedbrud.</li>
                        <li><strong>Høj (P2)</strong>: 4 timer respons, 1 arbejdsdag løsningstid, eksempel: Vigtige funktioner nede.</li>
                        <li><strong>Middel (P3)</strong>: 8 timer respons, 3 arbejdsdage løsningstid, eksempel: Mindre funktionelle problemer.</li>
                        <li><strong>Lav (P4)</strong>: 24 timer respons, 5 arbejdsdage løsningstid, eksempel: Forespørgsler om ikke-kritiske problemer.</li>
                      </ul>
                      <p><strong>5. Tilgængelighed og Supporttidspunkter</strong><br />
                      Normal Supporttid: Mandag til fredag, 08:00 - 17:00. Uden for normal tid tilbydes support kun efter aftale og kan medføre ekstra omkostninger.</p>
                      <p><strong>6. Eskaleringsprocedure</strong><br />
                      Hvis et incident ikke løses inden for den angivne tid, eskaleres til:<br />
                      • Level 1: Supervisor<br />
                      • Level 2: Supportchef<br />
                      • Level 3: IT-direktør for kritiske incidents.</p>
                      <p><strong>7. Aftalens Gyldighed og Ændringer</strong><br />
                      Denne SLA gælder fra [Startdato] og fortsætter i [Aftaleperiode] eller indtil en ændring aftales.</p>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>.
            </p>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={!isSlaAccepted}>Submit Ticket</Button>
      </form>
    </div>
  )
}