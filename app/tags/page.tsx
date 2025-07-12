"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Tag, TrendingUp } from "lucide-react"
import { getTags, followTag } from "@/lib/firestore-operations"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function TagsPage() {
  const { user } = useAuth()
  const [tags, setTags] = useState<any[]>([])
  const [filteredTags, setFilteredTags] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [followedTags, setFollowedTags] = useState<string[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getTags()
        // Sort by question count
        const sortedTags = fetchedTags.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0))
        setTags(sortedTags)
        setFilteredTags(sortedTags)
      } catch (error) {
        console.error("Error fetching tags:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredTags(filtered)
    } else {
      setFilteredTags(tags)
    }
  }, [searchQuery, tags])

  const handleFollowTag = async (tagName: string) => {
    if (!user) {
      toast({ title: "Please sign in to follow tags", variant: "destructive" })
      return
    }

    try {
      await followTag(user.uid, tagName)
      setFollowedTags([...followedTags, tagName])
      toast({ title: "Success!", description: `Now following ${tagName}` })
    } catch (error) {
      console.error("Error following tag:", error)
      toast({ title: "Error", description: "Failed to follow tag", variant: "destructive" })
    }
  }

  const popularTags = filteredTags.slice(0, 20)
  const allTags = filteredTags

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
        <p className="text-gray-600">
          Browse questions by tags. Follow tags to get personalized question recommendations.
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Popular Tags */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              <h2 className="text-xl font-semibold">Popular Tags</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {popularTags.map((tag) => (
                <Card key={tag.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/questions?tag=${tag.name}`}>
                        <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-orange-100">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.name}
                        </Badge>
                      </Link>
                      {user && !followedTags.includes(tag.name) && (
                        <Button variant="outline" size="sm" onClick={() => handleFollowTag(tag.name)}>
                          Follow
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {tag.questionCount || 0} question{(tag.questionCount || 0) !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-500">{tag.description || `Questions related to ${tag.name}`}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Tags */}
          <div>
            <div className="flex items-center mb-4">
              <Tag className="w-5 h-5 mr-2 text-gray-500" />
              <h2 className="text-xl font-semibold">All Tags ({allTags.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allTags.map((tag) => (
                <Card key={tag.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/questions?tag=${tag.name}`}>
                        <Badge variant="outline" className="text-sm cursor-pointer hover:bg-gray-100">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.name}
                        </Badge>
                      </Link>
                      {user && !followedTags.includes(tag.name) && (
                        <Button variant="outline" size="sm" onClick={() => handleFollowTag(tag.name)}>
                          Follow
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {tag.questionCount || 0} question{(tag.questionCount || 0) !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredTags.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No tags found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
