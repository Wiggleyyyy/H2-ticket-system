// WorkerLogin.js
"use client"

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/utils/supabase/client";
import { setCookie } from 'cookies-next';
import bcrypt from "bcryptjs";
import AuthLayout from "@/components/login/AuthLayout";
import LoginForm from "@/components/login/LoginForm";

export default function WorkerLogin() {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (email, password) => {
    if (!email || !password) {
      return toast({
        variant: "destructive",
        title: "Missing fields.",
        description: "Please fill out email and password.",
      });
    }

    try {
      const { data, error } = await supabase
        .from('Medarbejdere')
        .select('*')
        .eq('Mail', email)
        .single();

      if (error || !data) {
        return toast({
          variant: "destructive",
          title: "Error logging in",
          description: "Email not found. Please check your email.",
        });
      }

      const passwordMatch = await bcrypt.compare(password, data.HashedPassword);
      
      if (!passwordMatch) {
        return toast({
          variant: "destructive",
          title: "Error logging in",
          description: "Incorrect password. Please try again.",
        });
      }

      setCookie('user', JSON.stringify({ data }), { maxAge: 60 * 60 * 24 });

      toast({
        title: "Login successful",
        description: "Successfully logged in, redirecting to the dashboard.",
      });

      router.push("./dashboard/");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `${err.message}`,
      });
    }
  };

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleLogin} />
    </AuthLayout>
  );
}