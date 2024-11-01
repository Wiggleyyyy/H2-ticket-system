'use client'

import { supabase } from "@/app/utils/supabase/client"
import { useEffect } from "react"
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        //Check if logged in else return to login page
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("./login");
            }
        }

        // checkSession();

    }, [router]);
 
  return (
    <h1>
        test    
    </h1>
  )
}