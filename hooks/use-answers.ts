"use client"

import { useState, useEffect } from "react"
import { getAnswers } from "@/lib/firestore-operations"

export function useAnswers(questionId: string) {
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnswers = async () => {
      if (!questionId) return

      try {
        setLoading(true)
        const fetchedAnswers = await getAnswers(questionId)
        setAnswers(fetchedAnswers)
      } catch (err) {
        setError("Failed to fetch answers")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnswers()
  }, [questionId])

  const refetch = async () => {
    try {
      const fetchedAnswers = await getAnswers(questionId)
      setAnswers(fetchedAnswers)
    } catch (err) {
      console.error("Failed to refetch answers:", err)
    }
  }

  return { answers, loading, error, refetch }
}
