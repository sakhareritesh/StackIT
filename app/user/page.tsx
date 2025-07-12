"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Award, MessageSquare, TrendingUp, Search } from "lucide-react"
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { followUser } from "@/lib/firestore-operations"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("karma")
  const [loading, setLoading] = useState(true)
  const [followedUsers, setFollowedUsers] = useState<string[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, "users"), orderBy("karma", "desc"), limit(100))
        const usersSnapshot = await getDocs(usersQuery)
        const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUsers(usersData)
        setFilteredUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = [...users]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "karma":
        filtered.sort((a, b) => (b.karma || 0) - (a.karma || 0))
        break
      case "newest":
        filtered.sort((a, b) => (b.createdAt?.toDate?.() || new Date()) - (a.createdAt?.toDate?.() || new Date()))
        break
      case "username":
        filtered.sort((a, b) => a.username.localeCompare(b.username))
        break
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, sortBy])

  const handleFollowUser = async (userId: string, username: string) => {
    if (!user) {
      toast({ title: "Please sign in to follow users", variant: "destructive" })
      return
    }

    if (userId === user.uid) {
      toast({ title: "You cannot follow yourself", variant: "destructive" })
      return
    }

    try {
      await followUser(user.uid, userId)
      setFollowedUsers([...followedUsers, userId])
      toast({ title: "Success!", description: `Now following ${username}` })
    } catch (error) {
      console.error("Error following user:", error)
      toast({ title: "Error", description: "Failed to follow user", variant: "destructive" })
    }
  }

  const topContributors = filteredUsers.slice(0, 10)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Members</h1>
        <p className="text-gray-600">Discover and connect with top contributors in our community.</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="karma">Highest Karma</SelectItem>
                <SelectItem value="newest">Newest Members</SelectItem>
                <SelectItem value="username">Username A-Z</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSortBy("karma")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Top Contributors */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              <h2 className="text-xl font-semibold">Top Contributors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topContributors.map((contributor, index) => (
                <Card key={contributor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={contributor.avatar || ""} />
                          <AvatarFallback>{contributor.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/users/${contributor.id}`}>
                          <h3 className="font-semibold hover:text-orange-600 cursor-pointer">{contributor.username}</h3>
                        </Link>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant={contributor.role === "admin" ? "default" : "secondary"}>
                            {contributor.role}
                          </Badge>
                          <span>{contributor.karma || 0} karma</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <MessageSquare className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                        <p className="font-semibold">{contributor.questionsCount || 0}</p>
                        <p className="text-gray-500">Questions</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                        <p className="font-semibold">{contributor.answersCount || 0}</p>
                        <p className="text-gray-500">Answers</p>
                      </div>
                    </div>

                    {user && contributor.id !== user.uid && !followedUsers.includes(contributor.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleFollowUser(contributor.id, contributor.username)}
                      >
                        Follow
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Users */}
          <div>
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-gray-500" />
              <h2 className="text-xl font-semibold">All Members ({filteredUsers.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar || ""} />
                        <AvatarFallback>{member.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={`/users/${member.id}`}>
                          <h3 className="font-semibold hover:text-orange-600 cursor-pointer">{member.username}</h3>
                        </Link>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                          <span>{member.karma || 0} karma</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      Member since {member.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                    </div>

                    {user && member.id !== user.uid && !followedUsers.includes(member.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleFollowUser(member.id, member.username)}
                      >
                        Follow
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No users found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
