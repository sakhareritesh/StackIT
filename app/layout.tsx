import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "StackIt - Ask. Answer. Grow Together.",
  description:
    "A lightweight yet powerful Q&A forum for developers to ask questions, share knowledge, and grow together."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
