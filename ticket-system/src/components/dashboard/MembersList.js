// components/Dashboard/MembersList.js
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MembersList({ medarbejdere }) {
  return (
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
