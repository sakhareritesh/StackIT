"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown, Check, Bookmark } from "lucide-react"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useAuth } from "@/lib/auth-context"
import { formatDistanceToNow } from "date-fns"
import {
  getQuestion,
  getAnswers,
  createAnswer,
  handleUserVote,
  getUserVotes,
  acceptAnswer,
  toggleBookmark,
  createNotification,
  incrementQuestionViews,
} from "@/lib/firestore-operations"
import { toast } from "@/hooks/use-toast"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function QuestionDetailPage() {
  const params = useParams()
  const questionId = params.id as string
  const { user, userProfile } = useAuth()
  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newAnswer, setNewAnswer] = useState("")
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<string, string | null>>({})
  const [isBookmarked, setIsBookmarked] = useState(false)
  const hasIncrementedViews = useRef(false)

  // Real-time question updates
  useEffect(() => {
    if (!questionId) return

    const unsubscribe = onSnapshot(doc(db, "questions", questionId), (doc) => {
      if (doc.exists()) {
        setQuestion({ id: doc.id, ...doc.data() })
      }
      setLoading(false)
    })

    return unsubscribe
  }, [questionId])

  // Increment view count only once when first loading
  useEffect(() => {
    if (questionId && !hasIncrementedViews.current) {
      incrementQuestionViews(questionId)
      hasIncrementedViews.current = true
    }
  }, [questionId])

  // Real-time answers updates
  useEffect(() => {
    if (!questionId) return

    const fetchAnswers = async () => {
      try {
        const fetchedAnswers = await getAnswers(questionId)
        setAnswers(fetchedAnswers)
      } catch (error) {
        console.error("Error fetching answers:", error)
        // Don't show error to user for periodic fetches - fallback will handle it
      }
    }

    fetchAnswers()

    // Set up interval to refresh answers every 10 seconds
    const interval = setInterval(fetchAnswers, 10000)
    return () => clearInterval(interval)
  }, [questionId])

  // Load user votes
  useEffect(() => {
    const loadUserVotes = async () => {
      if (!user || !question) return

      const targetIds = [question.id, ...answers.map((a) => a.id)]
      const votes = await getUserVotes(user.uid, targetIds)
      setUserVotes(votes)
    }

    if (user && question && answers.length >= 0) {
      loadUserVotes()
    }
  }, [user, question, answers])

  // Check bookmark status
  useEffect(() => {
    if (user && userProfile && question) {
      setIsBookmarked(userProfile.bookmarks?.includes(question.id) || false)
    }
  }, [user, userProfile, question])

  const handleVote = async (targetId: string, targetType: "question" | "answer", voteType: "up" | "down") => {
    if (!user) {
      toast({ title: "Please sign in to vote", variant: "destructive" })
      return
    }

    try {
      const newVoteType = await handleUserVote(user.uid, targetId, targetType, voteType)
      setUserVotes((prev) => ({ ...prev, [targetId]: newVoteType }))

      // Refresh the specific item to get updated vote count
      if (targetType === "question") {
        const updatedQuestion = await getQuestion(questionId)
        if (updatedQuestion) setQuestion(updatedQuestion)
      } else {
        const updatedAnswers = await getAnswers(questionId)
        setAnswers(updatedAnswers)
      }

      toast({
        title: newVoteType ? `${voteType === "up" ? "Upvoted" : "Downvoted"}!` : "Vote removed",
        description: newVoteType ? "Thanks for your feedback!" : "Your vote has been removed",
      })
    } catch (error) {
      console.error("Error voting:", error)
      toast({ title: "Error", description: "Failed to vote", variant: "destructive" })
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newAnswer.trim()) return

    setSubmittingAnswer(true)

    try {
      const answerData = {
        questionId,
        content: newAnswer,
        authorId: user.uid,
        authorUsername: userProfile?.username || "Anonymous",
        upvotes: 0,
        downvotes: 0,
        isAccepted: false,
      }

      await createAnswer(answerData)

      // Create notification for question author (non-blocking)
      if (question && question.authorId !== user.uid) {
        createNotification({
          userId: question.authorId,
          type: "answer",
          message: `${userProfile?.username || "Someone"} answered your question: ${question.title}`,
          questionId,
        }).catch(err => {
          console.warn("Failed to create notification:", err)
          // Don't block the main flow
        })
      }

      setNewAnswer("")

      // Refresh answers (non-blocking)
      try {
        const updatedAnswers = await getAnswers(questionId)
        setAnswers(updatedAnswers)
      } catch (refreshError) {
        console.warn("Failed to refresh answers after posting:", refreshError)
        // Don't block the success flow - the periodic refresh will pick it up
      }

      toast({ title: "Success!", description: "Your answer has been posted" })
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast({ title: "Error", description: "Failed to post answer", variant: "destructive" })
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleAcceptAnswer = async (answerId: string, authorId: string) => {
    if (!user || !question || question.authorId !== user.uid) return

    try {
      await acceptAnswer(questionId, answerId, authorId)

      // Create notification for answer author (non-blocking)
      createNotification({
        userId: authorId,
        type: "accept",
        message: `Your answer was accepted for: ${question.title}`,
        questionId,
      }).catch(err => {
        console.warn("Failed to create notification:", err)
        // Don't block the main flow
      })

      // Refresh data (non-blocking)
      try {
        const updatedQuestion = await getQuestion(questionId)
        if (updatedQuestion) setQuestion(updatedQuestion)
      } catch (questionError) {
        console.warn("Failed to refresh question after acceptance:", questionError)
      }

      try {
        const updatedAnswers = await getAnswers(questionId)
        setAnswers(updatedAnswers)
      } catch (answersError) {
        console.warn("Failed to refresh answers after acceptance:", answersError)
      }

      toast({ title: "Success!", description: "Answer accepted" })
    } catch (error) {
      console.error("Error accepting answer:", error)
      toast({ title: "Error", description: "Failed to accept answer", variant: "destructive" })
    }
  }

  const handleBookmark = async () => {
    if (!user || !question) return

    try {
      const bookmarked = await toggleBookmark(user.uid, question.id)
      setIsBookmarked(bookmarked)
      toast({
        title: bookmarked ? "Bookmarked!" : "Bookmark removed",
        description: bookmarked ? "Question saved to your bookmarks" : "Question removed from bookmarks",
      })
    } catch (error) {
      console.error("Error bookmarking:", error)
      toast({ title: "Error", description: "Failed to bookmark question", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Question not found</h1>
        <p className="text-gray-600">The question you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>
                      Asked{" "}
                      {formatDistanceToNow(question.createdAt?.toDate?.() || new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>Viewed {question.views || 0} times</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBookmark}>
                    <Bookmark className={`w-4 h-4 mr-1 ${isBookmarked ? "fill-current text-orange-500" : ""}`} />
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                {/* Vote Buttons */}
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(question.id, "question", "up")}
                    className={userVotes[question.id] === "up" ? "text-orange-500 bg-orange-50" : ""}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                  <span className="text-lg font-semibold">{question.upvotes || 0}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(question.id, "question", "down")}
                    className={userVotes[question.id] === "down" ? "text-red-500 bg-red-50" : ""}
                  >
                    <ArrowDown className="w-5 h-5" />
                  </Button>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <div
                    className="prose prose-sm max-w-none mb-6"
                    dangerouslySetInnerHTML={{ __html: question.description }}
                  />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Author Info */}
                  <div className="flex justify-end">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">asked by</span>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback>{question.authorUsername?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{question.authorUsername || "Anonymous"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {answers.length} Answer{answers.length !== 1 ? "s" : ""}
              {question.isAnswered && (
                <span className="ml-2 text-sm text-green-600 font-normal">
                  (Question has been answered)
                </span>
              )}
            </h2>

            <div className="space-y-6">
              {answers
                .sort((a, b) => {
                  // Sort by accepted status first (accepted answers at top)
                  if (a.isAccepted && !b.isAccepted) return -1
                  if (!a.isAccepted && b.isAccepted) return 1
                  // Then sort by votes (higher votes first)
                  const votesDiff = (b.upvotes || 0) - (a.upvotes || 0)
                  if (votesDiff !== 0) return votesDiff
                  // Finally sort by creation date (newer first)
                  const aTime = a.createdAt?.toDate?.()?.getTime() || 0
                  const bTime = b.createdAt?.toDate?.()?.getTime() || 0
                  return bTime - aTime
                })
                .map((answer: any) => (
                  <Card 
                    key={answer.id} 
                    className={
                      answer.isAccepted 
                        ? "border-2 border-green-500 bg-gradient-to-r from-green-50 to-green-25 shadow-lg" 
                        : ""
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex space-x-4">
                        {/* Vote Buttons */}
                        <div className="flex flex-col items-center space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(answer.id, "answer", "up")}
                            className={userVotes[answer.id] === "up" ? "text-orange-500 bg-orange-50" : ""}
                          >
                            <ArrowUp className="w-5 h-5" />
                          </Button>
                          <span className="text-lg font-semibold">{answer.upvotes || 0}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(answer.id, "answer", "down")}
                            className={userVotes[answer.id] === "down" ? "text-red-500 bg-red-50" : ""}
                          >
                            <ArrowDown className="w-5 h-5" />
                          </Button>
                          {answer.isAccepted && (
                            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full shadow-md">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {user && question.authorId === user.uid && !answer.isAccepted && !question.isAnswered && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAcceptAnswer(answer.id, answer.authorId)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 hover:border-green-300"
                              title="Accept this answer"
                            >
                              <Check className="w-5 h-5" />
                            </Button>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          {answer.isAccepted && (
                            <div className="flex items-center space-x-2 mb-4 p-3 bg-green-100 rounded-lg border border-green-200">
                              <Check className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-semibold text-green-800">✓ Accepted Answer</span>
                              <span className="text-xs text-green-600 ml-auto">+15 reputation to author</span>
                            </div>
                          )}

                          <div
                            className="prose prose-sm max-w-none mb-6"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />

                          {/* Answer Author Info */}
                          <div className="flex justify-between items-end">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>
                                {answer.upvotes > 0 && (
                                  <span className="text-green-600 font-medium mr-2">
                                    +{answer.upvotes} votes
                                  </span>
                                )}
                                answered{" "}
                                {formatDistanceToNow(answer.createdAt?.toDate?.() || new Date(), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback>{answer.authorUsername?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900">{answer.authorUsername || "Anonymous"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Answer Form */}
          {user ? (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Your Answer</h3>
                {question.isAnswered && (
                  <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    ℹ️ This question has been answered, but you can still provide additional insights!
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <RichTextEditor content={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {question.authorId === user.uid && (
                        <span className="text-blue-600 font-medium">
                          💡 As the question author, you can accept the best answer
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={!newAnswer.trim() || submittingAnswer}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {submittingAnswer ? "Posting..." : "Post Your Answer"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">Please sign in to post an answer</p>
                <Button>Sign In</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Question Stats */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Question Stats</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Views</span>
                <span className="font-medium">{question.views || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Answers</span>
                <span className="font-medium">{answers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Score</span>
                <span className="font-medium">{question.upvotes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${question.isAnswered ? "text-green-600" : "text-orange-600"}`}>
                  {question.isAnswered ? "✓ Answered" : "📝 Open"}
                </span>
              </div>
              {question.isAnswered && question.acceptedAnswerId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Accepted Answer</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Activity</span>
                <span className="font-medium text-gray-700">
                  {formatDistanceToNow(question.updatedAt?.toDate?.() || question.createdAt?.toDate?.() || new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Question Tags</h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {question.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-orange-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
