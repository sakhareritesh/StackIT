"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Users, Flag, MessageSquare, Ban, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { collection, query, orderBy, getDocs, updateDoc, doc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

export default function AdminPage() {
  const { user, userProfile } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [flaggedContent, setFlaggedContent] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalAnswers: 0,
    flaggedItems: 0,
  })
  const [loading, setLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState("")

  useEffect(() => {
    if (userProfile?.role !== "admin") {
      return
    }

    const fetchAdminData = async () => {
      try {
        // Fetch users
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
        const usersSnapshot = await getDocs(usersQuery)
        const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUsers(usersData)

        // Fetch questions for stats
        const questionsSnapshot = await getDocs(collection(db, "questions"))
        const questionsData = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Fetch answers for stats
        const answersSnapshot = await getDocs(collection(db, "answers"))
        const answersData = answersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Mock flagged content (in production, this would be a separate collection)
        const flagged = [...questionsData.filter((q: any) => q.flagged), ...answersData.filter((a: any) => a.flagged)]

        setFlaggedContent(flagged)
        setStats({
          totalUsers: usersData.length,
          totalQuestions: questionsData.length,
          totalAnswers: answersData.length,
          flaggedItems: flagged.length,
        })
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [userProfile])

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBanned: !isBanned,
      })

      setUsers(users.map((user) => (user.id === userId ? { ...user, isBanned: !isBanned } : user)))

      toast({
        title: "Success",
        description: `User ${!isBanned ? "banned" : "unbanned"} successfully`,
      })
    } catch (error) {
      console.error("Error updating user ban status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleSendAlert = async () => {
    if (!alertMessage.trim()) return

    try {
      // Send notification to all users
      const batch = []
      for (const user of users) {
        batch.push(
          addDoc(collection(db, "notifications"), {
            userId: user.id,
            type: "admin_alert",
            message: alertMessage,
            isRead: false,
          }),
        )
      }

      await Promise.all(batch)
      setAlertMessage("")
      toast({
        title: "Success",
        description: "Alert sent to all users",
      })
    } catch (error) {
      console.error("Error sending alert:", error)
      toast({
        title: "Error",
        description: "Failed to send alert",
        variant: "destructive",
      })
    }
  }

  if (!user || userProfile?.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access the admin panel.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
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
      <div className="flex items-center space-x-3 mb-8">
        <Shield className="w-8 h-8 text-orange-500" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            <p className="text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.totalQuestions}</h3>
            <p className="text-gray-600">Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.totalAnswers}</h3>
            <p className="text-gray-600">Answers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Flag className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{stats.flaggedItems}</h3>
            <p className="text-gray-600">Flagged Items</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content">Content Moderation</TabsTrigger>
          <TabsTrigger value="alerts">Send Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold">{user.username}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                          <span className="text-sm text-gray-500">{user.karma || 0} karma</span>
                          {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={user.isBanned ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => handleBanUser(user.id, user.isBanned)}
                      >
                        {user.isBanned ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedContent.length > 0 ? (
                <div className="space-y-4">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <Badge variant="destructive">Flagged</Badge>
                            <span className="text-sm text-gray-500">{item.title ? "Question" : "Answer"}</span>
                          </div>
                          <h4 className="font-semibold mb-2">{item.title || "Answer Content"}</h4>
                          <div
                            className="prose prose-sm max-w-none text-gray-600"
                            dangerouslySetInnerHTML={{
                              __html: item.description || item.content || "",
                            }}
                          />
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-600">No flagged content to review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Platform Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Alert Message</label>
                  <Textarea
                    placeholder="Enter your alert message for all users..."
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleSendAlert}
                  disabled={!alertMessage.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Send Alert to All Users
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
