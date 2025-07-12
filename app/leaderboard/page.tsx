"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Crown, Star } from "lucide-react"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

interface LeaderboardUser {
  id: string
  username: string
  avatar?: string
  karma: number
  questionsCount: number
  answersCount: number
  acceptedAnswers: number
  badges: string[]
  rank: number
}

interface FirebaseUser {
  id: string
  username?: string
  avatar?: string
  karma?: number
  questionsCount?: number
  answersCount?: number
  acceptedAnswers?: number
  badges?: string[]
  createdAt?: any
  [key: string]: any
}

export default function LeaderboardPage() {
  const { user, userProfile } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log("Fetching leaderboard data...")
        
        // Fetch all users ordered by karma
        const usersQuery = query(collection(db, "users"), orderBy("karma", "desc"))
        const usersSnapshot = await getDocs(usersQuery)
        const allUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirebaseUser))

        console.log("Fetched users:", allUsers.length)
        
        // If no users found, show a helpful message
        if (allUsers.length === 0) {
          console.log("No users found in database")
          setError("No users found. The database appears to be empty.")
          return
        }
        
        console.log("Sample user data:", allUsers[0])

        // Calculate additional stats for each user
        const leaderboardData: LeaderboardUser[] = allUsers.map((userData, index) => ({
          id: userData.id,
          username: userData.username || "Anonymous",
          avatar: userData.avatar,
          karma: userData.karma || 0,
          questionsCount: userData.questionsCount || 0,
          answersCount: userData.answersCount || 0,
          acceptedAnswers: userData.acceptedAnswers || 0,
          badges: userData.badges || [],
          rank: index + 1,
        }))

        setLeaderboard(leaderboardData.slice(0, 100)) // Top 100
        setTotalParticipants(allUsers.length)

        // Find current user's rank
        if (user) {
          const userIndex = leaderboardData.findIndex((u) => u.id === user.uid)
          setCurrentUserRank(userIndex >= 0 ? userIndex + 1 : 0)
        }
      } catch (error: any) {
        console.error("Error fetching leaderboard:", error)
        setError(error.message || "Failed to load leaderboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-yellow-600"
    if (rank <= 10) return "bg-gradient-to-r from-orange-400 to-orange-600"
    if (rank <= 50) return "bg-gradient-to-r from-blue-400 to-blue-600"
    return "bg-gray-500"
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Leaderboard</h1>
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-sm text-gray-600">
                Please check your internet connection and try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentUser = user ? leaderboard.find((u) => u.id === user.uid) : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Global Ranking</h1>
          <p className="text-gray-600">Top contributors in our community</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Participants: {totalParticipants.toLocaleString()}</p>
        </div>
      </div>

      {/* Current User Rank (if logged in and has rank) */}
      {user && currentUserRank > 0 && (
        <Card className="mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white font-bold">
                {currentUserRank}
              </div>
              <Avatar className="w-12 h-12">
                <AvatarImage src={userProfile?.avatar || ""} />
                <AvatarFallback>{userProfile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{userProfile?.username}</h3>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    You
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {userProfile?.karma || 0} karma • {currentUser?.questionsCount || 0} questions •{" "}
                  {currentUser?.answersCount || 0} answers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
                <p className="text-gray-500">
                  The leaderboard is empty. Users will appear here once they start participating in the community.
                </p>
              </div>
            ) : (
              leaderboard.map((contributor) => (
                <div
                  key={contributor.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                    contributor.rank <= 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 h-12">
                    {contributor.rank <= 3 ? (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeColor(contributor.rank)}`}
                      >
                        {getRankIcon(contributor.rank)}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">{contributor.rank}</span>
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contributor.avatar || ""} />
                    <AvatarFallback>{contributor.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold hover:text-orange-600 cursor-pointer">
                        {contributor.username}
                      </h3>
                      {user && contributor.id === user.uid && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          You
                        </Badge>
                      )}
                      {contributor.badges.length > 0 && (
                        <div className="flex space-x-1">
                          {contributor.badges.slice(0, 3).map((badge, index) => (
                            <Award key={index} className="w-4 h-4 text-yellow-500" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {contributor.karma} karma
                      </span>
                      <span>{contributor.questionsCount} questions</span>
                      <span>{contributor.answersCount} answers</span>
                      {contributor.acceptedAnswers > 0 && (
                        <span className="text-green-600">{contributor.acceptedAnswers} accepted</span>
                      )}
                    </div>
                  </div>

                  {/* Rank Badge */}
                  <div className="text-right">
                    {contributor.rank <= 10 && (
                      <Badge variant="secondary" className={`${getRankBadgeColor(contributor.rank)} text-white border-0`}>
                        Top {contributor.rank <= 3 ? "3" : "10"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{leaderboard[0]?.karma || 0}</h3>
            <p className="text-gray-600">Highest Karma</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{totalParticipants}</h3>
            <p className="text-gray-600">Total Contributors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{leaderboard.reduce((acc, user) => acc + user.badges.length, 0)}</h3>
            <p className="text-gray-600">Total Badges</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
