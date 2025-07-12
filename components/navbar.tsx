"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Search, Plus, User, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/hooks/use-notifications"
import { AuthDialog } from "./auth-dialog"
import { formatDistanceToNow } from "date-fns"

export function Navbar() {
  const { user, userProfile, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StackIt</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search questions, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Ask AI Button */}
                <Link href="/ask-ai">
                  <Button variant="secondary">Ask AI</Button>
                </Link>

                {/* Ask Question Button */}
                <Link href="/ask">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
                  </Button>
                </Link>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2">
                      <h3 className="font-semibold mb-2">Notifications</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 10).map((notification: any) => (
                            <div
                              key={notification.id}
                              className={`p-2 hover:bg-gray-50 rounded cursor-pointer ${
                                !notification.isRead ? "bg-blue-50" : ""
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(notification.createdAt?.toDate() || new Date(), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No notifications</p>
                        )}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userProfile?.avatar || user?.photoURL || ""} />
                        <AvatarFallback>{userProfile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">{userProfile?.username || user?.displayName}</p>
                        <p className="text-xs text-gray-500">{userProfile?.karma || 0} karma</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="flex items-center">
                        <div className="w-4 h-4 mr-2">🏆</div>
                        Leaderboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/users" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {userProfile?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setShowAuthDialog(true)}>
                  Login
                </Button>
                <Button onClick={() => setShowAuthDialog(true)}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </nav>
  )
}
