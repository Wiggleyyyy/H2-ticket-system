// TicketList.js
'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket } from "lucide-react"
import TicketCard from "./TicketCard"

export default function TicketList({ tickets, medarbejdere, fetchTickets, fetchTicketNotes, userMetadata }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          Recent Tickets
        </CardTitle>
        <CardDescription>View and manage your recent tickets.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[75dvh] pr-4">
          <div className="space-y-4">
    
            {tickets.map((ticket) => (
            <TicketCard
                key={ticket.id}
                ticket={ticket}
                medarbejdere={medarbejdere}
                fetchTickets={fetchTickets}
                userMetadata={userMetadata} // Add this line
            />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}