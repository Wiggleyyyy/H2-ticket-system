// MembersList.js
'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateUserForm from "./CreateUserForm"

export default function MembersList({ medarbejdere, workerTicketCounts, userMetadata, fetchMedarbejdere }) {
  return (
    <>
      <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
        <div className="space-y-4">
          {medarbejdere.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <CardTitle>{employee.Fornavn} {employee.Efternavn}</CardTitle>
                <CardDescription>Department: {employee.Department}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Email: {employee.Mail}</p>
                <p>Phone: {employee.Phone}</p>
                <p>Is Supporter: {employee.IsSupporter ? "Yes" : "No"}</p>
                <p>Is Admin: {employee.IsAdmin ? "Yes" : "No"}</p>
                <p>Is Developer: {employee.IsDeveloper ? "Yes" : "No"}</p>
                <p>Assigned Tickets: {workerTicketCounts[employee.id] || 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      {(userMetadata.IsAdmin || userMetadata.IsDeveloper) && (
        <CreateUserForm fetchMedarbejdere={fetchMedarbejdere} />
      )}
    </>
  )
}