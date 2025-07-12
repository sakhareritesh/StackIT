"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Award, Bookmark, MessageSquare, TrendingUp, Camera, Users, Star, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { QuestionCard } from "@/components/question-card"
import { getUserStats, getBookmarkedQuestions } from "@/lib/firestore-operations"
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

export default function ProfilePage() {
  const { user, userProfile } = useAuth()
  const [userQuestions, setUserQuestions] = useState<any[]>([])
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    username: "",
    avatar: "",
    bio: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        username: userProfile.username || "",
        avatar: userProfile.avatar || "",
        bio: userProfile.bio || "",
      })
    }
  }, [userProfile])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !userProfile) return

      try {
        setLoading(true)

        // Fetch user statistics
        const stats = await getUserStats(user.uid)
        setUserStats(stats)

        // Fetch user's questions
        const questionsQuery = query(
          collection(db, "questions"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )
        const questionsSnapshot = await getDocs(questionsQuery)
        const questions = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUserQuestions(questions)

        // Fetch user's answers with question details
        const answersQuery = query(
          collection(db, "answers"),
          where("authorId", "==", user.uid),
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

        // Fetch bookmarked questions
        const bookmarks = await getBookmarkedQuestions(user.uid)
        setBookmarkedQuestions(bookmarks)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, userProfile])

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Check file size (limit to 500KB for avatar)
    if (file.size > 500 * 1024) {
      toast({ title: "Error", description: "Image size should be less than 500KB", variant: "destructive" })
      return
    }

    try {
      const base64String = await convertToBase64(file)
      setProfileData((prev) => ({ ...prev, avatar: base64String }))
    } catch (error) {
      console.error("Error converting image:", error)
      toast({ title: "Error", description: "Failed to process image", variant: "destructive" })
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return

    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: profileData.username,
        avatar: profileData.avatar,
        bio: profileData.bio,
      })

      setEditingProfile(false)
      toast({ title: "Success!", description: "Profile updated successfully" })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    }
  }

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.avatar || userProfile?.avatar || user.photoURL || ""} />
                <AvatarFallback className="text-2xl">
                  {profileData.username?.charAt(0).toUpperCase() ||
                    userProfile?.username?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              {editingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex-1">
              {editingProfile ? (
                <div className="space-y-4">
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Username"
                    className="text-2xl font-bold"
                  />
                  <Input
                    value={profileData.bio}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Bio"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveProfile} className="bg-orange-500 hover:bg-orange-600">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile?.username || "User"}</h1>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  {profileData.bio && <p className="text-gray-700 mb-4">{profileData.bio}</p>}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>Member since {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}</span>
                    <span>•</span>
                    <span>{userStats.karma || 0} karma points</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{userStats.followerCount || 0} followers</span>
                    </div>
                    <span>•</span>
                    <span>{userStats.followingCount || 0} following</span>
                  </div>
                </>
              )}
            </div>
            {!editingProfile && (
              <Button variant="outline" onClick={() => setEditingProfile(true)}>
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

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
            <h3 className="text-2xl font-bold">{userStats.karma || 0}</h3>
            <p className="text-gray-600">Karma</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Bookmark className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{bookmarkedQuestions.length}</h3>
            <p className="text-gray-600">Bookmarks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{userStats.badges?.length || 0}</h3>
            <p className="text-gray-600">Badges</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">My Questions ({userStats.questionsCount || 0})</TabsTrigger>
          <TabsTrigger value="answers">My Answers ({userStats.answersCount || 0})</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks ({bookmarkedQuestions.length})</TabsTrigger>
          <TabsTrigger value="badges">Badges ({userStats.badges?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {userQuestions.length > 0 ? (
            userQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                          {answer.isAccepted && (
                            <span className="text-green-600 ml-2">• Accepted Answer (+15 karma)</span>
                          )}
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
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">You haven't bookmarked any questions yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {userStats.badges && userStats.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userStats.badges.map((badge: string, index: number) => (
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
                  <p className="text-gray-600 mb-2">No badges earned yet.</p>
                  <p className="text-sm text-gray-500">Participate in the community to earn badges!</p>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>• Ask your first question to earn "First Contribution"</p>
                    <p>• Get your first answer accepted to earn "First Accepted Answer"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
