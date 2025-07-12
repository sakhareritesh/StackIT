"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createTestUsers, createTestQuestions } from "@/lib/test-data"
import { Button } from "@/components/ui/button"

export default function FirebaseTest() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

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
      await createTestUsers()
      await createTestQuestions()
      // Refresh the data
      await testFirebase()
    } catch (err: any) {
      setError("Failed to create test data: " + err.message)
    } finally {
      setCreating(false)
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
      
      {data.totalUsers === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 mb-2">No users found in the database.</p>
          <Button onClick={handleCreateTestData} disabled={creating}>
            {creating ? "Creating..." : "Create Test Data"}
          </Button>
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      
      <div className="mt-4">
        <Button onClick={testFirebase} disabled={loading}>
          Refresh Data
        </Button>
      </div>
    </div>
  )
}
