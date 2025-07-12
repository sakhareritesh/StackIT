"use client"

import { useState, useEffect } from "react"
import { getUserNotifications, markNotificationAsRead } from "@/lib/firestore-operations"
import { useAuth } from "@/lib/auth-context"

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([])
        setUnreadCount(0)
        setLoading(false)
        return
      }

      try {
        const fetchedNotifications = await getUserNotifications(user.uid)
        setNotifications(fetchedNotifications)
        setUnreadCount(fetchedNotifications.filter((n: any) => !n.isRead).length)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  return { notifications, loading, unreadCount, markAsRead }
}
