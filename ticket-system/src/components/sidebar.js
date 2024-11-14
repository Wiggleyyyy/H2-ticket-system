'use client';

import { HomeIcon, LogOutIcon, Ticket, PlusCircle, Users } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import MembersList from "@/components/dashboard/MembersList";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from './ui/separator';

export default function Sidebar({ medarbejdere, workerTicketCounts, userMetadata, fetchMedarbejdere, currentPage }) {
  const router = useRouter();
  
  const handleLogout = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/pages/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/pages/dashboard"
                className={`group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full ${
                  currentPage === "dashboard" ? "bg-blue-900" : "bg-primary text-black"
                } transition-colors md:h-8 md:w-8`}
              >
                <HomeIcon className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">Ticket System</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/pages/tickets"
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  currentPage === "tickets" ? "bg-accent" : "bg-none"
                } transition-colors hover:text-foreground md:h-8 md:w-8`}
              >
                <Ticket className="h-5 w-5" />
                <span className="sr-only">Tickets</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Tickets</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/pages/createTicket"
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  currentPage === "createTicket" ? "bg-accent" : "bg-none"
                } 
                transition-colors hover:text-foreground md:h-8 md:w-8`}
              >
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Create Ticket</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Create Ticket</TooltipContent>
          </Tooltip>

          <Separator />

          <Sheet>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-center w-9 h-9 p-0">
                    <Users className="h-5 w-5" />
                    <span className="sr-only">Members</span>
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">Members</TooltipContent>
            </Tooltip>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Members List</SheetTitle>
                <SheetDescription>List of all employees in Medarbejdere</SheetDescription>
              </SheetHeader>
              <MembersList 
                medarbejdere={medarbejdere} 
                workerTicketCounts={workerTicketCounts} 
                userMetadata={userMetadata}
                fetchMedarbejdere={fetchMedarbejdere}
              />
            </SheetContent>
          </Sheet>
        </nav>
        
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" className="w-9 h-9" onClick={handleLogout}>
                <LogOutIcon className="h-5 w-5"/>
                <span className="sr-only">Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
