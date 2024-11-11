// components/WorkerLoginSection.js
import { Button } from "@/components/ui/button"
import { UserCog } from "lucide-react"
import Link from "next/link"

export default function WorkerLoginSection() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">For Workers</h3>
      <Link href="/pages/login/">
        <Button variant="outline" className="w-full h-20 text-lg my-4" size="lg">
          <UserCog className="h-6 w-6 mr-2" />
          Worker Login
        </Button>
      </Link>
    </div>
  )
}