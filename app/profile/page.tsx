"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Award, Bookmark, MessageSquare, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { QuestionCard } from "@/components/question-card"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function ProfilePage() {
  const { user, userProfile } = useAuth()
  const [userQuestions, setUserQuestions] = useState<any[]>([])
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !userProfile) return

      try {
        // Fetch user's questions
        const questionsQuery = query(
          collection(db, "questions"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )
        const questionsSnapshot = await getDocs(questionsQuery)
        const questions = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUserQuestions(questions)

        // Fetch user's answers
        const answersQuery = query(
          collection(db, "answers"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )
        const answersSnapshot = await getDocs(answersQuery)
        const answers = answersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUserAnswers(answers)

        // Fetch bookmarked questions
        if (userProfile.bookmarks && userProfile.bookmarks.length > 0) {
          const bookmarksQuery = query(collection(db, "questions"), where("__name__", "in", userProfile.bookmarks))
          const bookmarksSnapshot = await getDocs(bookmarksQuery)
          const bookmarks = bookmarksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          setBookmarkedQuestions(bookmarks)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, userProfile])

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    questions: userQuestions.length,
    answers: userAnswers.length,
    karma: userProfile?.karma || 0,
    badges: userProfile?.badges?.length || 0,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userProfile?.avatar || user.photoURL || ""} />
              <AvatarFallback className="text-2xl">
                {userProfile?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile?.username || "User"}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Member since {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}</span>
                <span>•</span>
                <span>{stats.karma} karma points</span>
              </div>
            </div>
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.questions}</h3>
            <p className="text-gray-600">Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.answers}</h3>
            <p className="text-gray-600">Answers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.karma}</h3>
            <p className="text-gray-600">Karma</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Bookmark className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.badges}</h3>
            <p className="text-gray-600">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">My Questions ({stats.questions})</TabsTrigger>
          <TabsTrigger value="answers">My Answers ({stats.answers})</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks ({bookmarkedQuestions.length})</TabsTrigger>
          <TabsTrigger value="badges">Badges ({stats.badges})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {userQuestions.length > 0 ? (
            userQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">You haven't asked any questions yet.</p>
                <Button className="bg-orange-500 hover:bg-orange-600">Ask Your First Question</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          {userAnswers.length > 0 ? (
            <div className="space-y-4">
              {userAnswers.map((answer) => (
                <Card key={answer.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-lg font-semibold">{(answer.upvotes || 0) - (answer.downvotes || 0)}</span>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>
                      <div className="flex-1">
                        <div
                          className="prose prose-sm max-w-none mb-4"
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />
                        <div className="text-sm text-gray-500">
                          Answered {answer.createdAt?.toDate?.()?.toLocaleDateString() || "recently"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">You haven't answered any questions yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarkedQuestions.length > 0 ? (
            bookmarkedQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">You haven't bookmarked any questions yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile?.badges && userProfile.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfile.badges.map((badge, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Award className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h4 className="font-semibold">{badge}</h4>
                        <p className="text-sm text-gray-600">Achievement unlocked</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No badges earned yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Participate in the community to earn badges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
