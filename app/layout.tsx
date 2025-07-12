import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
      </body>
    </html>
  )
}
