// Home.js
'use client'

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "./utils/supabase/client"
import Layout from "@/components/landingPage/Layout"
import WorkerLoginSection from "@/components/landingPage/WorkerLoginSection"
import TicketSubmissionForm from "@/components/landingPage/TicketSubmissionForm"

export default function Home() {
  const { toast } = useToast();

  const createTicket = async (ticketData) => {
    const { data, error } = await supabase
      .from("Tickets")
      .insert([ticketData])
      .select()

    if (error) {
      console.log(error)
      return toast({
        variant: "destructive",
        title: "Couldn't create a ticket",
        description: "There was an error creating the ticket, please try again later",
      });
    }

    toast({
      variant: "",
      title: "Ticket created",
      description: "Your ticket will be handled shortly",
    });
  }

  return (
    <Layout>
      <div className="grid md:grid-cols-2 gap-6">
        <WorkerLoginSection />
        <TicketSubmissionForm onSubmit={createTicket} />
      </div>
    </Layout>
  )
}