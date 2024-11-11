// CreateUserForm.js
'use client'

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/utils/supabase/client"
import bcrypt from "bcryptjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function CreateUserForm({ fetchMedarbejdere }) {
  const { toast } = useToast()
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    Fornavn: "",
    Efternavn: "",
    Department: "",
    Mail: "",
    Phone: "",
    IsSupporter: false,
    IsAdmin: false,
    IsDeveloper: false,
    HashedPassword: "",
  })

  const handleCreateUser = async () => {
    const hashedPassword = await bcrypt.hash(newUser.HashedPassword, 10)
    
    const userToSave = {
      ...newUser,
      HashedPassword: hashedPassword,
    }

    const { data, error } = await supabase
      .from("Medarbejdere")
      .insert([userToSave])
      .select()

    if (error) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "User created",
        description: "New user has been successfully created.",
      })
      setNewUser({
        Fornavn: "",
        Efternavn: "",
        Department: "",
        Mail: "",
        Phone: "",
        IsSupporter: false,
        IsAdmin: false,
        IsDeveloper: false,
        HashedPassword: "",
      })
      setIsCreateUserOpen(false)
      fetchMedarbejdere()
    }
  }

  return (
    <div className="mt-4">
      <AlertDialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="default" className="w-full mt-4">Create User</Button>
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
  )
}