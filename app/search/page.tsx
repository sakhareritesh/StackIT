"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { QuestionCard } from "@/components/question-card"
import { searchQuestions } from "@/lib/firestore-operations"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      const searchResults = await searchQuestions(query.trim())
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Questions</h1>

        <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search questions, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {initialQuery && (
          <p className="text-gray-600">
            Search results for: <span className="font-semibold">"{initialQuery}"</span>
          </p>
        )}
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
      ) : hasSearched ? (
        results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No questions found matching your search.</p>
            <p className="text-sm text-gray-500">Try different keywords or check your spelling.</p>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Enter a search term to find questions.</p>
        </div>
      )}
    </div>
  )
}
