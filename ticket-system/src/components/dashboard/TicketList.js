// components/Dashboard/TicketList.js
import TicketCard from "./TicketCard";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TicketList({ tickets, medarbejdere }) {
  return (
    <ScrollArea className="h-[75dvh] pr-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} medarbejdere={medarbejdere} />
      ))}
    </ScrollArea>
  );
}
