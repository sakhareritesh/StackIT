import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  setDoc,
} from "firebase/firestore"
import { db } from "./firebase"

// User operations
export const createUserProfile = async (userData: any) => {
  try {
    await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

export const updateUserProfile = async (uid: string, updates: any) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Badge operations
export const awardBadge = async (userId: string, badgeName: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const currentBadges = userData.badges || []

      if (!currentBadges.includes(badgeName)) {
        await updateDoc(userRef, {
          badges: arrayUnion(badgeName),
          updatedAt: serverTimestamp(),
        })
        return true
      }
    }
    return false
  } catch (error) {
    console.error("Error awarding badge:", error)
    throw error
  }
}

// Check and award first contribution badge
export const checkFirstContribution = async (userId: string) => {
  try {
    // Check if user has any questions or answers
    const questionsQuery = query(collection(db, "questions"), where("authorId", "==", userId), limit(1))
    const answersQuery = query(collection(db, "answers"), where("authorId", "==", userId), limit(1))

    const [questionsSnapshot, answersSnapshot] = await Promise.all([getDocs(questionsQuery), getDocs(answersQuery)])

    if (questionsSnapshot.size > 0 || answersSnapshot.size > 0) {
      await awardBadge(userId, "First Contribution")
    }
  } catch (error) {
    console.error("Error checking first contribution:", error)
  }
}

// Question operations
export const createQuestion = async (questionData: any) => {
  try {
    const docRef = await addDoc(collection(db, "questions"), {
      ...questionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Check for first contribution badge
    await checkFirstContribution(questionData.authorId)

    return docRef.id
  } catch (error) {
    console.error("Error creating question:", error)
    throw error
  }
}

export const getQuestion = async (questionId: string) => {
  try {
    const questionDoc = await getDoc(doc(db, "questions", questionId))
    return questionDoc.exists() ? { id: questionDoc.id, ...questionDoc.data() } : null
  } catch (error) {
    console.error("Error getting question:", error)
    throw error
  }
}

export const getQuestions = async (limitCount = 10) => {
  try {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"), limit(limitCount))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting questions:", error)
    throw error
  }
}

export const updateQuestion = async (questionId: string, updates: any) => {
  try {
    await updateDoc(doc(db, "questions", questionId), {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating question:", error)
    throw error
  }
}

export const incrementQuestionViews = async (questionId: string) => {
  try {
    await updateDoc(doc(db, "questions", questionId), {
      views: increment(1),
    })
  } catch (error) {
    console.error("Error incrementing views:", error)
  }
}

// Answer operations
export const createAnswer = async (answerData: any) => {
  try {
    const docRef = await addDoc(collection(db, "answers"), {
      ...answerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Update question answer count
    await updateDoc(doc(db, "questions", answerData.questionId), {
      answerCount: increment(1),
      updatedAt: serverTimestamp(),
    })

    // Check for first contribution badge
    await checkFirstContribution(answerData.authorId)

    return docRef.id
  } catch (error) {
    console.error("Error creating answer:", error)
    throw error
  }
}

export const getAnswers = async (questionId: string) => {
  try {
    const q = query(
      collection(db, "answers"),
      where("questionId", "==", questionId),
      orderBy("isAccepted", "desc"), // Accepted answers first
      orderBy("createdAt", "desc"),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting answers:", error)
    throw error
  }
}

export const updateAnswer = async (answerId: string, updates: any) => {
  try {
    await updateDoc(doc(db, "answers", answerId), {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating answer:", error)
    throw error
  }
}

export const acceptAnswer = async (questionId: string, answerId: string, authorId: string) => {
  try {
    const batch = writeBatch(db)

    // First, unaccept any previously accepted answers for this question
    const existingAnswersQuery = query(
      collection(db, "answers"),
      where("questionId", "==", questionId),
      where("isAccepted", "==", true),
    )
    const existingAnswersSnapshot = await getDocs(existingAnswersQuery)

    existingAnswersSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isAccepted: false })
    })

    // Update question
    batch.update(doc(db, "questions", questionId), {
      acceptedAnswerId: answerId,
      isAnswered: true,
      updatedAt: serverTimestamp(),
    })

    // Update answer
    batch.update(doc(db, "answers", answerId), {
      isAccepted: true,
      updatedAt: serverTimestamp(),
    })

    // Award karma to answer author
    batch.update(doc(db, "users", authorId), {
      karma: increment(15),
      acceptedAnswers: increment(1),
    })

    await batch.commit()

    // Award badge for first accepted answer
    await awardBadge(authorId, "First Accepted Answer")
  } catch (error) {
    console.error("Error accepting answer:", error)
    throw error
  }
}

// Vote operations - Updated to handle single vote per user
export const handleUserVote = async (
  userId: string,
  targetId: string,
  targetType: "question" | "answer",
  voteType: "up" | "down",
) => {
  try {
    const voteId = `${userId}_${targetId}`
    const voteRef = doc(db, "votes", voteId)
    const voteDoc = await getDoc(voteRef)

    const collectionName = targetType === "question" ? "questions" : "answers"
    const targetRef = doc(db, collectionName, targetId)

    let voteChange = 0
    let newVoteType = null

    if (voteDoc.exists()) {
      const currentVote = voteDoc.data()
      if (currentVote.type === voteType) {
        // Remove vote if clicking same button
        await updateDoc(voteRef, { type: null })
        voteChange = voteType === "up" ? -1 : 1
        newVoteType = null
      } else {
        // Change vote type
        await updateDoc(voteRef, { type: voteType })
        if (currentVote.type === "up" && voteType === "down") {
          voteChange = -2
        } else if (currentVote.type === "down" && voteType === "up") {
          voteChange = 2
        }
        newVoteType = voteType
      }
    } else {
      // Create new vote
      await setDoc(voteRef, {
        userId,
        targetId,
        targetType,
        type: voteType,
        createdAt: serverTimestamp(),
      })
      voteChange = voteType === "up" ? 1 : -1
      newVoteType = voteType
    }

    // Update vote count
    if (voteChange !== 0) {
      await updateDoc(targetRef, {
        upvotes: increment(voteChange),
      })
    }

    return newVoteType
  } catch (error) {
    console.error("Error handling vote:", error)
    throw error
  }
}

// Get all user votes for multiple targets
export const getUserVotes = async (userId: string, targetIds: string[]) => {
  try {
    const votes: Record<string, string | null> = {}

    for (const targetId of targetIds) {
      const voteId = `${userId}_${targetId}`
      const voteDoc = await getDoc(doc(db, "votes", voteId))
      votes[targetId] = voteDoc.exists() ? voteDoc.data()?.type || null : null
    }

    return votes
  } catch (error) {
    console.error("Error getting user votes:", error)
    return {}
  }
}

export const createVote = async (voteData: any) => {
  try {
    const voteId = `${voteData.userId}_${voteData.targetId}`
    await updateDoc(doc(db, "votes", voteId), voteData)
  } catch (error) {
    // If document doesn't exist, create it
    try {
      const voteId = `${voteData.userId}_${voteData.targetId}`
      await addDoc(collection(db, "votes"), {
        ...voteData,
        id: voteId,
        createdAt: serverTimestamp(),
      })
    } catch (createError) {
      console.error("Error creating vote:", createError)
      throw createError
    }
  }
}

export const updateVoteCount = async (targetId: string, targetType: "question" | "answer", voteChange: number) => {
  try {
    const collectionName = targetType === "question" ? "questions" : "answers"
    await updateDoc(doc(db, collectionName, targetId), {
      upvotes: increment(voteChange),
    })
  } catch (error) {
    console.error("Error updating vote count:", error)
    throw error
  }
}

export const getUserVote = async (userId: string, targetId: string) => {
  try {
    const voteId = `${userId}_${targetId}`
    const voteDoc = await getDoc(doc(db, "votes", voteId))
    return voteDoc.exists() ? voteDoc.data() : null
  } catch (error) {
    console.error("Error getting user vote:", error)
    return null
  }
}

// Notification operations
export const createNotification = async (notificationData: any) => {
  try {
    await addDoc(collection(db, "notifications"), {
      ...notificationData,
      createdAt: serverTimestamp(),
      isRead: false,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export const getUserNotifications = async (userId: string) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting notifications:", error)
    throw error
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      isRead: true,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Search operations
export const searchQuestions = async (searchTerm: string) => {
  try {
    // Simple search implementation - in production, use Algolia or similar
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"), limit(50))
    const querySnapshot = await getDocs(q)
    const allQuestions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return allQuestions.filter(
      (question: any) =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  } catch (error) {
    console.error("Error searching questions:", error)
    throw error
  }
}

// Tag operations
export const getTags = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tags"))
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting tags:", error)
    throw error
  }
}

export const createOrUpdateTag = async (tagName: string) => {
  try {
    const tagQuery = query(collection(db, "tags"), where("name", "==", tagName))
    const querySnapshot = await getDocs(tagQuery)

    if (querySnapshot.empty) {
      // Create new tag
      await addDoc(collection(db, "tags"), {
        name: tagName,
        questionCount: 1,
        createdAt: serverTimestamp(),
      })
    } else {
      // Update existing tag
      const tagDoc = querySnapshot.docs[0]
      await updateDoc(tagDoc.ref, {
        questionCount: increment(1),
      })
    }
  } catch (error) {
    console.error("Error creating/updating tag:", error)
    throw error
  }
}

// Bookmark operations - Fixed
export const toggleBookmark = async (userId: string, questionId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const bookmarks = userData.bookmarks || []

      if (bookmarks.includes(questionId)) {
        // Remove bookmark
        await updateDoc(userRef, {
          bookmarks: arrayRemove(questionId),
        })
        return false
      } else {
        // Add bookmark
        await updateDoc(userRef, {
          bookmarks: arrayUnion(questionId),
        })
        return true
      }
    }
    return false
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    throw error
  }
}

// Get bookmarked questions
export const getBookmarkedQuestions = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (!userDoc.exists()) return []

    const userData = userDoc.data()
    const bookmarks = userData.bookmarks || []

    if (bookmarks.length === 0) return []

    // Fetch all bookmarked questions
    const bookmarkedQuestions = []
    for (const questionId of bookmarks) {
      try {
        const questionDoc = await getDoc(doc(db, "questions", questionId))
        if (questionDoc.exists()) {
          bookmarkedQuestions.push({ id: questionDoc.id, ...questionDoc.data() })
        }
      } catch (error) {
        console.error(`Error fetching question ${questionId}:`, error)
      }
    }

    return bookmarkedQuestions
  } catch (error) {
    console.error("Error getting bookmarked questions:", error)
    throw error
  }
}

// Follow operations
export const followUser = async (followerId: string, followingId: string) => {
  try {
    // Check if already following
    const followQuery = query(
      collection(db, "follows"),
      where("followerId", "==", followerId),
      where("followingId", "==", followingId),
    )
    const followSnapshot = await getDocs(followQuery)

    if (!followSnapshot.empty) {
      return false // Already following
    }

    await addDoc(collection(db, "follows"), {
      followerId,
      followingId,
      type: "user",
      createdAt: serverTimestamp(),
    })

    // Update follower counts
    await updateDoc(doc(db, "users", followerId), {
      followingCount: increment(1),
    })
    await updateDoc(doc(db, "users", followingId), {
      followerCount: increment(1),
    })

    return true
  } catch (error) {
    console.error("Error following user:", error)
    throw error
  }
}

export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    const followQuery = query(
      collection(db, "follows"),
      where("followerId", "==", followerId),
      where("followingId", "==", followingId),
    )
    const followSnapshot = await getDocs(followQuery)

    if (followSnapshot.empty) {
      return false // Not following
    }

    // Delete the follow relationship
    const batch = writeBatch(db)
    followSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Update follower counts
    batch.update(doc(db, "users", followerId), {
      followingCount: increment(-1),
    })
    batch.update(doc(db, "users", followingId), {
      followerCount: increment(-1),
    })

    await batch.commit()
    return true
  } catch (error) {
    console.error("Error unfollowing user:", error)
    throw error
  }
}

export const isFollowing = async (followerId: string, followingId: string) => {
  try {
    const followQuery = query(
      collection(db, "follows"),
      where("followerId", "==", followerId),
      where("followingId", "==", followingId),
    )
    const followSnapshot = await getDocs(followQuery)
    return !followSnapshot.empty
  } catch (error) {
    console.error("Error checking follow status:", error)
    return false
  }
}

export const followTag = async (userId: string, tagName: string) => {
  try {
    await addDoc(collection(db, "follows"), {
      followerId: userId,
      followingTag: tagName,
      type: "tag",
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error following tag:", error)
    throw error
  }
}

// Get user statistics
export const getUserStats = async (userId: string) => {
  try {
    const [questionsSnapshot, answersSnapshot, userDoc] = await Promise.all([
      getDocs(query(collection(db, "questions"), where("authorId", "==", userId))),
      getDocs(query(collection(db, "answers"), where("authorId", "==", userId))),
      getDoc(doc(db, "users", userId)),
    ])

    const questions = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const answers = answersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    const userData = userDoc.exists() ? userDoc.data() : {}

    const acceptedAnswers = answers.filter((answer) => answer.isAccepted).length
    const totalViews = questions.reduce((sum, question) => sum + (question.views || 0), 0)
    const totalUpvotes = [...questions.map((q) => q.upvotes || 0), ...answers.map((a) => a.upvotes || 0)].reduce(
      (sum, votes) => sum + votes,
      0,
    )

    return {
      questionsCount: questions.length,
      answersCount: answers.length,
      acceptedAnswers,
      totalViews,
      totalUpvotes,
      karma: userData.karma || 0,
      badges: userData.badges || [],
      followerCount: userData.followerCount || 0,
      followingCount: userData.followingCount || 0,
      bookmarks: userData.bookmarks || [],
    }
  } catch (error) {
    console.error("Error getting user stats:", error)
    throw error
  }
}
