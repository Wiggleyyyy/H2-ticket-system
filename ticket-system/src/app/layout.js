'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import localFont from "next/font/local"
import { useTheme } from 'next-themes'
import "./globals.css"
import { Toaster } from '@/components/ui/toaster'
import ThemeSelector from '@/components/ThemeSelector'
import { TooltipProvider } from '@/components/ui/tooltip'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeSelector />
          <TooltipProvider>
          {children}
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
        
      </body>
    </html>
  )
}