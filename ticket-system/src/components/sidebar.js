import { HomeIcon, LogOutIcon, Ticket, TicketPlus, User, Users } from "lucide-react"
import Link from "next/link"
import { File, Home, LineChart, ListFilter, MoreHorizontal, Package, Package2, PanelLeft, PlusCircle, Search, Settings, ShoppingCart, Users2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const Sidebar = () => {           
    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link
                href="./dashboard"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                <HomeIcon className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">Ticket System</span>
                </Link>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                    href="./tickets"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
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
                    href="./createTicket"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">Create Ticket</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Create Ticket</TooltipContent>
                </Tooltip>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                    href="./createTicket"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                    <Users className="h-5 w-5" />
                    <span className="sr-only">Users</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Users</TooltipContent>
                </Tooltip>
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LogOutIcon className="h-5 w-5"/>
                <span className="sr-only">Logout</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
        </aside>
    );
};

export default Sidebar;