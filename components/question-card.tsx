"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowUp, MessageSquare, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface QuestionCardProps {
  question: any
}

export function QuestionCard({ question }: QuestionCardProps) {
  const stripHtml = (html: string) => {
    if (!html) return ""
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const createdAt = question.createdAt?.toDate
    ? question.createdAt.toDate()
    : new Date(question.createdAt || Date.now())

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/questions/${question.id}`} className="flex-1">
            <h3 className="text-lg font-semibold hover:text-orange-600 transition-colors">{question.title}</h3>
          </Link>
          {question.isAnswered && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Answered
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mt-2">{stripHtml(question.description)}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags?.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <ArrowUp className="w-4 h-4" />
              <span>{(question.upvotes || 0) - (question.downvotes || 0)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{question.answerCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{question.views || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {(question.authorUsername || "A").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <span className="font-medium">{question.authorUsername || "Anonymous"}</span>
              <span className="text-gray-500 ml-2">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
