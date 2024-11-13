// TicketList.js
'use client'
import TicketCard from "./TicketCard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { File, Home, LineChart, ListFilter, MoreHorizontal, Package, Package2, PanelLeft, PlusCircle, Search, Settings, ShoppingCart, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Open</TabsTrigger>
            <TabsTrigger value="draft">Progress</TabsTrigger>
            <TabsTrigger value="archived">Done</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Newest</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Date</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Assigned</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Priority</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Ticket
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
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
        </TabsContent>
      </Tabs>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>30</strong>{" "}
          tickets
        </div>
      </CardFooter>
    </Card>
  )
}