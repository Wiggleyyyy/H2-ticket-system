"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MembersList({ medarbejdere, userMetadata, workerTicketCounts, handleCreateUser }) {
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({
      Fornavn: "",
      Efternavn: "",
      Department: "",
      Mail: "",
      Phone: "",
      IsSupporter: false,
      IsAdmin: false,
      IsDeveloper: false,
      HashedPassw: "",
    });
    
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
              <p>Is Supporter: {employee.IsSupporter ? "Yes" : "No"}</p>
              <p>Is Admin: {employee.IsAdmin ? "Yes" : "No"}</p>
              <p>Is Developer: {employee.IsDeveloper ? "Yes" : "No"}</p>
              <p>Assigned Tickets: {workerTicketCounts[employee.id] || 0}</p>
            </CardContent>
          </Card>
        ))}
        {(userMetadata.IsAdmin || userMetadata.IsDeveloper) && (
          <div className="mt-4">
            <AlertDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4">Create User</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create New User</AlertDialogTitle>
                  <AlertDialogDescription>Fill in the details to create a new employee.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="First Name"
                    value={newUser.Fornavn}
                    onChange={(e) => setNewUser({ ...newUser, Fornavn: e.target.value })}
                  />
                  <Input
                    placeholder="Last Name"
                    value={newUser.Efternavn}
                    onChange={(e) => setNewUser({ ...newUser, Efternavn: e.target.value })}
                  />
                  <Input
                    placeholder="Department"
                    value={newUser.Department}
                    onChange={(e) => setNewUser({ ...newUser, Department: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newUser.Mail}
                    onChange={(e) => setNewUser({ ...newUser, Mail: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    type="tel"
                    value={newUser.Phone}
                    onChange={(e) => setNewUser({ ...newUser, Phone: e.target.value })}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newUser.HashedPassword}
                    onChange={(e) => setNewUser({ ...newUser, HashedPassword: e.target.value })}
                  />
                  <div className="flex gap-4">
                    <Label>
                      <Input
                        type="checkbox"
                        checked={newUser.IsSupporter}
                        onChange={(e) => setNewUser({ ...newUser, IsSupporter: e.target.checked })}
                      /> Supporter
                    </Label>
                    <Label>
                      <Input
                        type="checkbox"
                        checked={newUser.IsAdmin}
                        onChange={(e) => setNewUser({ ...newUser, IsAdmin: e.target.checked })}
                      /> Admin
                    </Label>
                    <Label>
                      <Input
                        type="checkbox"
                        checked={newUser.IsDeveloper}
                        onChange={(e) => setNewUser({ ...newUser, IsDeveloper: e.target.checked })}
                      /> Developer
                    </Label>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCreateUser}>Create User</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    );
  }
  