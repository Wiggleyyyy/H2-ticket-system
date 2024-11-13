// TicketList.js
'use client'
import TicketCard from "./TicketCard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TicketList({ tickets, medarbejdere, fetchTickets, fetchTicketNotes, userMetadata }) {
  return (
    <Card x-chunk="dashboard-06-chunk-0">
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
        <CardDescription>
          View and manage your recent tickets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Error Code</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Date Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} medarbejdere={medarbejdere} fetchTickets={fetchTickets} userMetadata={userMetadata}/>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong>{" "}
          tickets
        </div>
      </CardFooter>
    </Card>
  )
}