// components/Dashboard/TicketCard.js
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";

export default function TicketCard({ ticket, medarbejdere }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ticket.TicketNavn}</CardTitle>
        <CardDescription>Created for: {ticket.Navn}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{ticket.Beskrivelse}</p>
        {/* More details here... */}
      </CardContent>
      <CardFooter>
        <p>Created at: {new Date(ticket.created_at).toLocaleString()}</p>
      </CardFooter>
    </Card>
  );
}
