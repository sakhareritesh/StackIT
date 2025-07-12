"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createTestUsers, createTestQuestions } from "@/lib/test-data"
import { migrateUserData, populateUserContentIds } from "@/lib/firestore-operations"
import { Button } from "@/components/ui/button"

export default function FirebaseTest() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [migrating, setMigrating] = useState(false)

  const testFirebase = async () => {
    try {
      console.log("Testing Firebase connection...")
      
      // Test basic connection
      const usersQuery = query(collection(db, "users"))
      const snapshot = await getDocs(usersQuery)
      
      console.log("Firebase connected successfully!")
      console.log("Number of users found:", snapshot.docs.length)
      
      const users = snapshot.docs.map((doc) => {
        const data = doc.data()
        console.log("User data:", data)
        return { id: doc.id, ...data }
      })
      
      setData({ 
        totalUsers: users.length, 
        users: users.slice(0, 5), // First 5 users
        sampleUser: users[0] || null
      })
    } catch (err: any) {
      console.error("Firebase error:", err)
      setError(err.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testFirebase()
  }, [])

  const handleCreateTestData = async () => {
    setCreating(true)
    try {
      const userCount = await createTestUsers()
      const questions = await createTestQuestions()
      console.log(`Created ${userCount} users and ${questions.length} questions`)
      // Refresh the data
      await testFirebase()
    } catch (err: any) {
      setError("Failed to create test data: " + err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleMigrateData = async () => {
    setMigrating(true)
    try {
      const updateCount = await migrateUserData()
      await populateUserContentIds()
      console.log(`Migration completed: ${updateCount} users updated`)
      // Refresh the data
      await testFirebase()
    } catch (err: any) {
      setError("Failed to migrate data: " + err.message)
    } finally {
      setMigrating(false)
    }
  }

  const testProfileFunctions = async () => {
    try {
      if (!data?.users?.length) {
        setError("No users found. Create test data first.")
        return
      }

      const testUserId = data.users[0].id
      console.log("Testing profile functions for user:", testUserId)

      // Import the new functions
      const { getUserQuestions, getUserAnswers, getUserStats } = await import("@/lib/firestore-operations")

      // Test getUserStats
      const stats = await getUserStats(testUserId)
      console.log("User stats:", stats)

      // Test getUserQuestions
      const questions = await getUserQuestions(testUserId)
      console.log("User questions:", questions)

      // Test getUserAnswers
      const answers = await getUserAnswers(testUserId)
      console.log("User answers:", answers)

      setData((prev: any) => ({
        ...prev,
        testResults: {
          stats,
          questions: questions.slice(0, 3), // First 3 questions
          answers: answers.slice(0, 3), // First 3 answers
        }
      }))
    } catch (err: any) {
      console.error("Profile function test error:", err)
      setError(err.message || "Unknown error")
    }
  }

  if (loading) {
    return <div className="p-8">Loading Firebase test...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Firebase Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test Results</h1>
      
      <div className="flex gap-4 mb-6">
        {data.totalUsers === 0 && (
          <Button onClick={handleCreateTestData} disabled={creating}>
            {creating ? "Creating..." : "Create Test Data"}
          </Button>
        )}
        
        <Button onClick={handleMigrateData} disabled={migrating} variant="outline">
          {migrating ? "Migrating..." : "Migrate Existing Data"}
        </Button>
        
        <Button onClick={testProfileFunctions} disabled={loading} variant="outline">
          Test Profile Functions
        </Button>
        
        <Button onClick={testFirebase} disabled={loading} variant="outline">
          Refresh Data
        </Button>
      </div>
      
      {data.totalUsers === 0 ? (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 mb-2">No users found in the database.</p>
          <p className="text-sm text-gray-600">Click "Create Test Data" to populate with sample users and questions.</p>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">Found {data.totalUsers} users in the database.</p>
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}
