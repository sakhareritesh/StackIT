"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown, Check, Flag, Bookmark } from "lucide-react"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useAuth } from "@/lib/auth-context"
import { useQuestion } from "@/hooks/use-questions"
import { useAnswers } from "@/hooks/use-answers"
import { formatDistanceToNow } from "date-fns"
import {
  createAnswer,
  createVote,
  updateVoteCount,
  getUserVote,
  acceptAnswer,
  toggleBookmark,
  createNotification,
} from "@/lib/firestore-operations"
import { toast } from "@/hooks/use-toast"

export default function QuestionDetailPage() {
  const params = useParams()
  const questionId = params.id as string
  const { user, userProfile } = useAuth()
  const { question, loading: questionLoading } = useQuestion(questionId)
  const { answers, loading: answersLoading, refetch: refetchAnswers } = useAnswers(questionId)
  const [newAnswer, setNewAnswer] = useState("")
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({})
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    // Load user votes for question and answers
    const loadUserVotes = async () => {
      if (!user) return

      const votes: Record<string, "up" | "down" | null> = {}

      // Get vote for question
      if (question) {
        const questionVote = await getUserVote(user.uid, question.id)
        votes[question.id] = questionVote?.type || null
      }

      // Get votes for answers
      for (const answer of answers) {
        const answerVote = await getUserVote(user.uid, answer.id)
        votes[answer.id] = answerVote?.type || null
      }

      setUserVotes(votes)
    }

    if (user && (question || answers.length > 0)) {
      loadUserVotes()
    }
  }, [user, question, answers])

  useEffect(() => {
    // Check if question is bookmarked
    if (user && userProfile && question) {
      setIsBookmarked(userProfile.bookmarks?.includes(question.id) || false)
    }
  }, [user, userProfile, question])

  const handleVote = async (targetId: string, targetType: "question" | "answer", voteType: "up" | "down") => {
    if (!user) {
      toast({ title: "Please sign in to vote", variant: "destructive" })
      return
    }

    const currentVote = userVotes[targetId]
    const newVote = currentVote === voteType ? null : voteType

    try {
      // Calculate vote change
      let voteChange = 0
      if (currentVote === null && newVote === "up") voteChange = 1
      else if (currentVote === null && newVote === "down") voteChange = -1
      else if (currentVote === "up" && newVote === null) voteChange = -1
      else if (currentVote === "up" && newVote === "down") voteChange = -2
      else if (currentVote === "down" && newVote === null) voteChange = 1
      else if (currentVote === "down" && newVote === "up") voteChange = 2

      // Update local state immediately
      setUserVotes({ ...userVotes, [targetId]: newVote })

      // Update in Firestore
      await createVote({
        userId: user.uid,
        targetId,
        targetType,
        type: newVote,
      })

      await updateVoteCount(targetId, targetType, voteChange)

      // Award karma for upvotes
      if (newVote === "up" && currentVote !== "up") {
        // Find the author and award karma
        const target = targetType === "question" ? question : answers.find((a) => a.id === targetId)
        if (target && target.authorId !== user.uid) {
          // Award karma to author (this would be done in a cloud function in production)
        }
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({ title: "Error", description: "Failed to vote", variant: "destructive" })
      // Revert local state
      setUserVotes({ ...userVotes, [targetId]: currentVote })
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

      // Create notification for question author
      if (question && question.authorId !== user.uid) {
        await createNotification({
          userId: question.authorId,
          type: "answer",
          message: `${userProfile?.username || "Someone"} answered your question: ${question.title}`,
          questionId,
        })
      }

      setNewAnswer("")
      await refetchAnswers()
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

      // Create notification for answer author
      await createNotification({
        userId: authorId,
        type: "accept",
        message: `Your answer was accepted for: ${question.title}`,
        questionId,
      })

      await refetchAnswers()
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

  if (questionLoading) {
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
                      {formatDistanceToNow(question.createdAt?.toDate() || new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>
                      Modified{" "}
                      {formatDistanceToNow(question.updatedAt?.toDate() || new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>Viewed {question.views || 0} times</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleBookmark}>
                    <Bookmark className={`w-4 h-4 mr-1 ${isBookmarked ? "fill-current" : ""}`} />
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="w-4 h-4 mr-1" />
                    Flag
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
                    className={userVotes[question.id] === "up" ? "text-orange-500" : ""}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                  <span className="text-lg font-semibold">{(question.upvotes || 0) - (question.downvotes || 0)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(question.id, "question", "down")}
                    className={userVotes[question.id] === "down" ? "text-red-500" : ""}
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
            </h2>

            {answersLoading ? (
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {answers.map((answer: any) => (
                  <Card key={answer.id} className={answer.isAccepted ? "border-green-500 bg-green-50" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex space-x-4">
                        {/* Vote Buttons */}
                        <div className="flex flex-col items-center space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(answer.id, "answer", "up")}
                            className={userVotes[answer.id] === "up" ? "text-orange-500" : ""}
                          >
                            <ArrowUp className="w-5 h-5" />
                          </Button>
                          <span className="text-lg font-semibold">
                            {(answer.upvotes || 0) - (answer.downvotes || 0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(answer.id, "answer", "down")}
                            className={userVotes[answer.id] === "down" ? "text-red-500" : ""}
                          >
                            <ArrowDown className="w-5 h-5" />
                          </Button>
                          {answer.isAccepted && (
                            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {user && question.authorId === user.uid && !answer.isAccepted && !question.isAnswered && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAcceptAnswer(answer.id, answer.authorId)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-5 h-5" />
                            </Button>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          {answer.isAccepted && (
                            <div className="flex items-center space-x-2 mb-4">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-700">Accepted Answer</span>
                            </div>
                          )}

                          <div
                            className="prose prose-sm max-w-none mb-6"
                            dangerouslySetInnerHTML={{ __html: answer.content }}
                          />

                          {/* Answer Author Info */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Flag className="w-4 h-4 mr-1" />
                                Flag
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-500">
                                answered{" "}
                                {formatDistanceToNow(answer.createdAt?.toDate() || new Date(), {
                                  addSuffix: true,
                                })}
                              </span>
                              <Avatar className="w-6 h-6">
                                <AvatarFallback>{answer.authorUsername?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{answer.authorUsername || "Anonymous"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Answer Form */}
          {user ? (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Your Answer</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <RichTextEditor content={newAnswer} onChange={setNewAnswer} placeholder="Write your answer here..." />
                  <div className="flex justify-end">
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
                <span className="font-medium">{(question.upvotes || 0) - (question.downvotes || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${question.isAnswered ? "text-green-600" : "text-orange-600"}`}>
                  {question.isAnswered ? "Answered" : "Open"}
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
