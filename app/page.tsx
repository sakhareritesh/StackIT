"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Users, MessageSquare } from "lucide-react"
import { QuestionCard } from "@/components/question-card"
import Link from "next/link"
import { useRouter } from "next/navigation"

const popularTags = [
  "javascript",
  "react",
  "nextjs",
  "typescript",
  "firebase",
  "node.js",
  "python",
  "css",
  "html",
  "mongodb",
]

export default function HomePage() {

  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Ask. Answer. Grow Together.</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of developers helping each other solve problems and share knowledge.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for questions, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg text-gray-900"
                />
              </div>
            </form>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/questions">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Browse Questions
              </Button>
            </Link>
            <Link href="/ask">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-orange-500"
              >
                Ask a Question
              </Button>
            </Link>
          </div>
        </div>
      </section>

      

      
    </div>
  )
}
