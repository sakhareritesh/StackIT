"use client"

import { useState, useEffect } from "react"
import { getQuestions, getQuestion, incrementQuestionViews } from "@/lib/firestore-operations"

export function useQuestions(limit = 10) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const fetchedQuestions = await getQuestions(limit)
      setQuestions(fetchedQuestions)
    } catch (err) {
      setError("Failed to fetch questions")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [limit])

  return { questions, loading, error, refetch: () => fetchQuestions() }
}

export function useQuestion(questionId: string) {
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestion = async () => {
    if (!questionId) return

    try {
      setLoading(true)
      const fetchedQuestion = await getQuestion(questionId)
      if (fetchedQuestion) {
        setQuestion(fetchedQuestion)
        // Increment view count
        await incrementQuestionViews(questionId)
      } else {
        setError("Question not found")
      }
    } catch (err) {
      setError("Failed to fetch question")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestion()
  }, [questionId])

  return { question, loading, error }
}
