"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { auth, db } from "./firebase"

interface UserProfile {
  uid: string
  email: string
  username: string
  role: "guest" | "user" | "admin"
  karma: number
  badges: string[]
  createdAt: any
  isBanned: boolean
  bookmarks?: string[]
  followerCount?: number
  followingCount?: number
  avatar?: string
  bio?: string
  acceptedAnswers?: number
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Set up real-time listener for user profile
        const userDocRef = doc(db, "users", user.uid)
        const unsubscribeProfile = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data() as UserProfile)
            } else {
              setUserProfile(null)
            }
            setLoading(false)
          },
          (error) => {
            console.error("Error listening to user profile:", error)
            setLoading(false)
          },
        )

        // Return cleanup function for profile listener
        return () => unsubscribeProfile()
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return unsubscribeAuth
  }, [])

  const refreshProfile = async () => {
    if (!user) return

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile)
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        username,
        role: "user",
        karma: 0,
        badges: [],
        createdAt: new Date(),
        isBanned: false,
        bookmarks: [],
        followerCount: 0,
        followingCount: 0,
        acceptedAnswers: 0,
      }
      await setDoc(doc(db, "users", user.uid), userProfile)
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw new Error(error.message || "Failed to create account")
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          username: user.displayName || user.email!.split("@")[0],
          role: "user",
          karma: 0,
          badges: [],
          createdAt: new Date(),
          isBanned: false,
          bookmarks: [],
          followerCount: 0,
          followingCount: 0,
          avatar: user.photoURL || undefined,
          acceptedAnswers: 0,
        }
        await setDoc(doc(db, "users", user.uid), userProfile)
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw new Error(error.message || "Failed to sign in with Google")
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error: any) {
      console.error("Logout error:", error)
      throw new Error(error.message || "Failed to logout")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
