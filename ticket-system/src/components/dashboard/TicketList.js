'use client'

import { useState, useEffect } from 'react'
import TicketCard from "./TicketCard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { File, ListFilter, PlusCircle, Calendar1 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Import Popover components
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar" // Import your calendar component

export default function TicketList({ tickets, medarbejdere, fetchTickets, fetchTicketNotes, userMetadata }) {
  const router = useRouter()

  const [filteredTickets, setFilteredTickets] = useState(tickets)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showWorkerDropdown, setShowWorkerDropdown] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [sortOrder, setSortOrder] = useState(null)

  useEffect(() => {
    let result = tickets;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(ticket => 
        (statusFilter === 'open' && !ticket.Done && !ticket.Ongoing) ||
        (statusFilter === 'in progress' && ticket.Ongoing && !ticket.Done) ||
        (statusFilter === 'done' && ticket.Done)
      );
    }

    // Worker filter
    if (selectedWorker) {
      result = result.filter(ticket => ticket.MedarbejderId === selectedWorker);
    }

    // Date filter
    if (selectedDate) {
      result = result.filter(ticket => {
        const ticketDate = new Date(ticket.created_at).toDateString();
        return ticketDate === selectedDate.toDateString();
      });
    }

    // Sort by "Newest"
    if (sortOrder === 'newest') {
      result = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredTickets(result);
  }, [tickets, statusFilter, selectedWorker, selectedDate, sortOrder]);

  const clearFilters = () => {
    setStatusFilter('all')
    setSelectedWorker(null)
    setSelectedDate(null)
    setShowWorkerDropdown(false)
    setSortOrder(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
        <CardDescription>
          View and manage your recent tickets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <div className="flex items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in progress">In Progress</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              {showWorkerDropdown && (
                <Select
                  value={selectedWorker || ""}
                  onValueChange={(value) => setSelectedWorker(value)}
                >
                  <SelectTrigger className="space-y-2">
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {medarbejdere.map(worker => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.Fornavn} {worker.Efternavn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Calendar1/>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                    }}
                    className="shadow-lg border rounded-md"
                  />
                </PopoverContent>
              </Popover>
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
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === 'newest'}
                    onCheckedChange={() => {
                      setSortOrder(sortOrder === 'newest' ? null : 'newest')
                      setShowWorkerDropdown(false)
                    }}
                  >
                    Newest
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onCheckedChange={() => {
                      setShowWorkerDropdown(true)
                    }}
                  >
                    Assigned
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem onCheckedChange={() => setShowWorkerDropdown(false)}>
                    Priority
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={clearFilters}>
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1" onClick={() => router.push("./createTicket")}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Ticket
                </span>
              </Button>
            </div>
          </div>
          <TabsContent value={statusFilter}>
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
                {filteredTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    medarbejdere={medarbejdere} 
                    fetchTickets={fetchTickets} 
                    userMetadata={userMetadata}
                  />
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredTickets.length}</strong> of <strong>{tickets.length}</strong>{" "}
          tickets
        </div>
      </CardFooter>
    </Card>
  )
}
