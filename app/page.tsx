"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Users, MessageSquare } from "lucide-react"
import { QuestionCard } from "@/components/question-card"
import { useQuestions } from "@/hooks/use-questions"
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
  const { questions, loading } = useQuestions(10)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const stats = {
    totalQuestions: questions.length || 0,
    totalAnswers: questions.reduce((acc, q) => acc + (q.answerCount || 0), 0),
    totalUsers: 1250, // This would come from a separate query in production
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

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <MessageSquare className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalQuestions.toLocaleString()}</h3>
              <p className="text-gray-600">Questions Asked</p>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalAnswers.toLocaleString()}</h3>
              <p className="text-gray-600">Answers Provided</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</h3>
              <p className="text-gray-600">Community Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Questions Feed */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Questions</h2>
              <Link href="/questions">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No questions yet. Be the first to ask!</p>
                <Link href="/ask">
                  <Button className="bg-orange-500 hover:bg-orange-600">Ask a Question</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Tags */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-orange-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Community Guidelines</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Be respectful and constructive</li>
                <li>• Search before asking</li>
                <li>• Provide clear, detailed questions</li>
                <li>• Accept helpful answers</li>
                <li>• Help others when you can</li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/ask" className="block">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Ask a Question
                  </Button>
                </Link>
                <Link href="/tags" className="block">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Browse Tags
                  </Button>
                </Link>
                <Link href="/users" className="block">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    Top Contributors
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
