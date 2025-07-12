"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Trash2, Camera } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, userProfile, logout } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    username: userProfile?.username || "",
    email: user?.email || "",
    bio: userProfile?.bio || "",
    avatar: userProfile?.avatar || "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    answerNotifications: true,
    commentNotifications: true,
  })

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to access settings</h1>
      </div>
    )
  }

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
    if (!file) return

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
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        username: profileData.username,
        bio: profileData.bio,
        avatar: profileData.avatar,
      })

      toast({ title: "Success!", description: "Profile updated successfully" })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        notificationSettings,
      })

      toast({ title: "Success!", description: "Notification settings updated" })
    } catch (error) {
      console.error("Error updating notifications:", error)
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your questions, answers, and data.",
    )

    if (!confirmed) return

    const doubleConfirm = window.prompt('To confirm account deletion, please type "DELETE" in the box below:')

    if (doubleConfirm !== "DELETE") {
      toast({ title: "Account deletion cancelled", description: "Confirmation text did not match" })
      return
    }

    setLoading(true)
    try {
      // Delete user document
      await deleteDoc(doc(db, "users", user.uid))

      // Note: In a production app, you'd also need to:
      // 1. Delete all user's questions, answers, votes, etc.
      // 2. Delete the Firebase Auth user account
      // 3. Handle this through Cloud Functions for data consistency

      await logout()
      router.push("/")
      toast({ title: "Account deleted", description: "Your account has been permanently deleted" })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({ title: "Error", description: "Failed to delete account", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl">
                    {profileData.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 500KB</p>
                </div>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileData.email} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Digest</h4>
                    <p className="text-sm text-gray-500">Get a weekly summary of activity</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, weeklyDigest: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Answer Notifications</h4>
                    <p className="text-sm text-gray-500">Get notified when someone answers your questions</p>
                  </div>
                  <Switch
                    checked={notificationSettings.answerNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, answerNotifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Comment Notifications</h4>
                    <p className="text-sm text-gray-500">Get notified about comments on your posts</p>
                  </div>
                  <Switch
                    checked={notificationSettings.commentNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, commentNotifications: checked }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Profile Visibility</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Your profile is currently public. Other users can see your questions, answers, and activity.
                  </p>
                  <Button variant="outline">Make Profile Private</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Data Export</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a copy of all your data including questions, answers, and profile information.
                  </p>
                  <Button variant="outline">Export My Data</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Blocked Users</h4>
                  <p className="text-sm text-gray-600 mb-4">Manage users you've blocked from interacting with you.</p>
                  <Button variant="outline">Manage Blocked Users</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Account Status</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Your account is active. You joined on{" "}
                  {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || "recently"}.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span>Role: {userProfile?.role || "user"}</span>
                  <span>•</span>
                  <span>Karma: {userProfile?.karma || 0}</span>
                  <span>•</span>
                  <span>Status: {userProfile?.isBanned ? "Banned" : "Active"}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h5 className="font-medium mb-2">Delete Account</h5>
                  <p className="text-sm text-gray-600 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
