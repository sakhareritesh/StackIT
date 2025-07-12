"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Award, MessageSquare, TrendingUp, Calendar, Star, Check, Users } from "lucide-react"
import { doc, collection, query, where, orderBy, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { QuestionCard } from "@/components/question-card"
import { formatDistanceToNow } from "date-fns"
import { followUser, unfollowUser, isFollowing, getUserStats } from "@/lib/firestore-operations"
import { toast } from "@/hooks/use-toast"

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [userQuestions, setUserQuestions] = useState<any[]>([])
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [isFollowingUser, setIsFollowingUser] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return

      try {
        // Set up real-time listener for user profile
        const userDocRef = doc(db, "users", userId)
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfileUser({ id: doc.id, ...doc.data() })
          }
        })

        // Fetch user statistics
        const stats = await getUserStats(userId)
        setUserStats(stats)

        // Fetch user's questions
        const questionsQuery = query(
          collection(db, "questions"),
          where("authorId", "==", userId),
          orderBy("createdAt", "desc"),
        )
        const questionsSnapshot = await getDocs(questionsQuery)
        const questions = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUserQuestions(questions)

        // Fetch user's answers with question details
        const answersQuery = query(
          collection(db, "answers"),
          where("authorId", "==", userId),
          orderBy("createdAt", "desc"),
        )
        const answersSnapshot = await getDocs(answersQuery)
        const answers = answersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Fetch question details for each answer
        const answersWithQuestions = await Promise.all(
          answers.map(async (answer) => {
            try {
              const questionQuery = query(collection(db, "questions"), where("__name__", "==", answer.questionId))
              const questionSnapshot = await getDocs(questionQuery)
              const questionData = questionSnapshot.docs[0]?.data()
              return {
                ...answer,
                questionTitle: questionData?.title || "Question not found",
                questionId: answer.questionId,
              }
            } catch (error) {
              console.error("Error fetching question for answer:", error)
              return {
                ...answer,
                questionTitle: "Question not found",
                questionId: answer.questionId,
              }
            }
          }),
        )
        setUserAnswers(answersWithQuestions)

        // Check if current user is following this user
        if (currentUser && currentUser.uid !== userId) {
          const following = await isFollowing(currentUser.uid, userId)
          setIsFollowingUser(following)
        }

        return unsubscribe
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId, currentUser])

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return

    if (userId === currentUser.uid) {
      toast({ title: "You cannot follow yourself", variant: "destructive" })
      return
    }

    setFollowLoading(true)
    try {
      if (isFollowingUser) {
        await unfollowUser(currentUser.uid, userId)
        setIsFollowingUser(false)
        toast({ title: "Success!", description: `Unfollowed ${profileUser.username}` })
      } else {
        await followUser(currentUser.uid, userId)
        setIsFollowingUser(true)
        toast({ title: "Success!", description: `Now following ${profileUser.username}` })
      }

      // Refresh user stats to update follower count
      const updatedStats = await getUserStats(userId)
      setUserStats(updatedStats)
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast({ title: "Error", description: "Failed to update follow status", variant: "destructive" })
    } finally {
      setFollowLoading(false)
    }
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

  if (!profileUser) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileUser.avatar || ""} />
              <AvatarFallback className="text-2xl">
                {profileUser.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profileUser.username}</h1>
                <Badge variant={profileUser.role === "admin" ? "default" : "secondary"}>
                  {profileUser.role || "user"}
                </Badge>
                {profileUser.isBanned && <Badge variant="destructive">Banned</Badge>}
              </div>
              <p className="text-gray-600 mb-4">{profileUser.bio || "No bio available"}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Joined {formatDistanceToNow(profileUser.createdAt?.toDate?.() || new Date(), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{profileUser.karma || 0} karma</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{profileUser.followerCount || 0} followers</span>
                </div>
                <span>•</span>
                <span>{profileUser.followingCount || 0} following</span>
              </div>
              {currentUser && currentUser.uid !== userId && (
                <Button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={isFollowingUser ? "bg-gray-500 hover:bg-gray-600" : "bg-orange-500 hover:bg-orange-600"}
                >
                  {followLoading ? "Loading..." : isFollowingUser ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{userStats.questionsCount || 0}</h3>
            <p className="text-gray-600">Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{userStats.answersCount || 0}</h3>
            <p className="text-gray-600">Answers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{userStats.acceptedAnswers || 0}</h3>
            <p className="text-gray-600">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{profileUser.karma || 0}</h3>
            <p className="text-gray-600">Karma</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{profileUser.followerCount || 0}</h3>
            <p className="text-gray-600">Followers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{profileUser.badges?.length || 0}</h3>
            <p className="text-gray-600">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Questions ({userStats.questionsCount || 0})</TabsTrigger>
          <TabsTrigger value="answers">Answers ({userStats.answersCount || 0})</TabsTrigger>
          <TabsTrigger value="badges">Badges ({profileUser.badges?.length || 0})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {userQuestions.length > 0 ? (
            userQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No questions asked yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          {userAnswers.length > 0 ? (
            <div className="space-y-4">
              {userAnswers.map((answer) => (
                <Card key={answer.id} className={answer.isAccepted ? "border-green-500 bg-green-50" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-lg font-semibold">{answer.upvotes || 0}</span>
                        <span className="text-xs text-gray-500">votes</span>
                        {answer.isAccepted && (
                          <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        {answer.isAccepted && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Accepted Answer
                            </Badge>
                          </div>
                        )}
                        <h4 className="font-semibold text-blue-600 hover:text-blue-800 mb-2">
                          <a href={`/questions/${answer.questionId}`}>{answer.questionTitle}</a>
                        </h4>
                        <div
                          className="prose prose-sm max-w-none mb-4"
                          dangerouslySetInnerHTML={{ __html: answer.content }}
                        />
                        <div className="text-sm text-gray-500">
                          Answered{" "}
                          {formatDistanceToNow(answer.createdAt?.toDate?.() || new Date(), { addSuffix: true })}
                          {answer.isAccepted && <span className="text-green-600 ml-2">• Accepted Answer</span>}
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
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No answers provided yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {profileUser.badges && profileUser.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileUser.badges.map((badge: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                    >
                      <Award className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{badge}</h4>
                        <p className="text-sm text-gray-600">Achievement unlocked</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No badges earned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Combine questions and answers for activity feed */}
                {[...userQuestions.slice(0, 5), ...userAnswers.slice(0, 5)]
                  .sort((a, b) => (b.createdAt?.toDate?.() || new Date()) - (a.createdAt?.toDate?.() || new Date()))
                  .slice(0, 10)
                  .map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-orange-200">
                      <div className="flex-shrink-0">
                        {item.title ? (
                          <MessageSquare className="w-5 h-5 text-orange-500" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          {item.title ? "Asked a question:" : "Provided an answer"}
                          <span className="font-medium ml-1">
                            {item.title || item.questionTitle || "Answer to a question"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(item.createdAt?.toDate?.() || new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                {userQuestions.length === 0 && userAnswers.length === 0 && (
                  <div className="text-center py-8">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
