"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useAuth } from "@/lib/auth-context"
import { createQuestion, createOrUpdateTag } from "@/lib/firestore-operations"
import { toast } from "@/hooks/use-toast"
import { X } from "lucide-react"

const suggestedTags = [
  "javascript",
  "react",
  "nextjs",
  "typescript",
  "firebase",
  "node.js",
  "python",
  "css",
  "html",
  "mongodb",
  "express",
  "tailwindcss",
  "api",
  "database",
  "authentication",
]

export default function AskQuestionPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    isAnonymous: false,
  })
  const [tagInput, setTagInput] = useState("")

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to ask a question</h1>
        <p className="text-gray-600">You need to be logged in to post questions.</p>
      </div>
    )
  }

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag && !formData.tags.includes(normalizedTag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, normalizedTag] })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    if (formData.tags.length === 0) {
      toast({ title: "Error", description: "Please add at least one tag", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      const questionData = {
        title: formData.title.trim(),
        description: formData.description,
        tags: formData.tags,
        authorId: user.uid,
        authorUsername: formData.isAnonymous ? "Anonymous" : userProfile?.username || "Anonymous",
        isAnonymous: formData.isAnonymous,
        upvotes: 0,
        downvotes: 0,
        views: 0,
        answerCount: 0,
        isAnswered: false,
        acceptedAnswerId: null,
      }

      const questionId = await createQuestion(questionData)

      // Update tag counts
      for (const tag of formData.tags) {
        await createOrUpdateTag(tag)
      }

      toast({ title: "Success!", description: "Your question has been posted" })
      router.push(`/questions/${questionId}`)
    } catch (error) {
      console.error("Error posting question:", error)
      toast({ title: "Error", description: "Failed to post question. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">
          Get help from our community of developers. Be specific and provide context for better answers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Card>
          <CardHeader>
            <CardTitle>Question Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="title">Be specific and imagine you're asking a question to another person</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., How to implement authentication in Next.js with Firebase?"
              maxLength={255}
              className="mt-2"
              required
            />
            <p className="text-sm text-gray-500 mt-1">{formData.title.length}/255 characters</p>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Provide all the details someone would need to understand and answer your question</Label>
            <div className="mt-2">
              <RichTextEditor
                content={formData.description}
                onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Describe your problem in detail. Include what you've tried, error messages, and expected behavior..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="tags">Add up to 5 tags to describe what your question is about</Label>
            <div className="mt-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Type a tag and press Enter"
                disabled={formData.tags.length >= 5}
              />
            </div>

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter((tag) => !formData.tags.includes(tag))
                  .slice(0, 10)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-50"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anonymous Option */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
              />
              <Label htmlFor="anonymous">Post anonymously</Label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Your username will be hidden, but you can still manage your question
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.description.trim() || formData.tags.length === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? "Posting..." : "Post Question"}
          </Button>
        </div>
      </form>

      {/* Tips Sidebar */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tips for asking a great question</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Search to see if your question has been asked before</li>
            <li>• Make your title specific and descriptive</li>
            <li>• Include relevant code, error messages, or screenshots</li>
            <li>• Explain what you've already tried</li>
            <li>• Use proper formatting and grammar</li>
            <li>• Add relevant tags to help others find your question</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
