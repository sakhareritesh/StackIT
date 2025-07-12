"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Plus } from "lucide-react"
import { QuestionCard } from "@/components/question-card"
import { useQuestions } from "@/hooks/use-questions"
import { getTags } from "@/lib/firestore-operations"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function QuestionsPage() {
  const { questions: allQuestions, loading } = useQuestions(50)
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterTag, setFilterTag] = useState("all")
  const [tags, setTags] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getTags()
        setTags(fetchedTags)
      } catch (error) {
        console.error("Error fetching tags:", error)
      }
    }
    fetchTags()
  }, [])

  useEffect(() => {
    let filtered = [...allQuestions]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          question.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply tag filter
    if (filterTag !== "all") {
      filtered = filtered.filter((question) => question.tags.includes(filterTag))
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => (b.createdAt?.toDate?.() || new Date()) - (a.createdAt?.toDate?.() || new Date()))
        break
      case "oldest":
        filtered.sort((a, b) => (a.createdAt?.toDate?.() || new Date()) - (b.createdAt?.toDate?.() || new Date()))
        break
      case "most-voted":
        filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        break
      case "most-answers":
        filtered.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0))
        break
      case "most-views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
    }

    setFilteredQuestions(filtered)
  }, [allQuestions, searchQuery, sortBy, filterTag])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Questions</h1>
          <p className="text-gray-600">{filteredQuestions.length} questions found</p>
        </div>
        <Link href="/ask">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most-voted">Most Voted</SelectItem>
                <SelectItem value="most-answers">Most Answers</SelectItem>
                <SelectItem value="most-views">Most Views</SelectItem>
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name} ({tag.questionCount || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSortBy("newest")
                setFilterTag("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
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
      ) : filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">No questions found matching your criteria.</p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSortBy("newest")
                  setFilterTag("all")
                }}
              >
                Clear Filters
              </Button>
              <Link href="/ask">
                <Button className="bg-orange-500 hover:bg-orange-600">Ask a Question</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
