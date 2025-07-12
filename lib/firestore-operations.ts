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

    // Update user statistics
    await updateUserQuestionCount(questionData.authorId, docRef.id)

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

    // Update user statistics
    await updateUserAnswerCount(answerData.authorId, docRef.id)

    return docRef.id
  } catch (error) {
    console.error("Error creating answer:", error)
    throw error
  }
}

export const getAnswers = async (questionId: string) => {
  try {
    // Try the optimized query first (requires composite index)
    const q = query(
      collection(db, "answers"),
      where("questionId", "==", questionId),
      orderBy("createdAt", "desc")
    )
    const querySnapshot = await getDocs(q)
    const answers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    
    // Sort answers to show accepted answers first, then by votes, then by date
    return answers.sort((a: any, b: any) => {
      // Accepted answers always come first
      if (a.isAccepted && !b.isAccepted) return -1
      if (!a.isAccepted && b.isAccepted) return 1
      
      // If both are accepted or both are not accepted, sort by votes
      const aVotes = (a.upvotes || 0) - (a.downvotes || 0)
      const bVotes = (b.upvotes || 0) - (b.downvotes || 0)
      if (aVotes !== bVotes) return bVotes - aVotes
      
      // Finally sort by creation date (newer first)
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error("Error getting answers:", error)
    
    // Fallback: try simple query without orderBy (no index required)
    try {
      console.log("Falling back to simple query for answers...")
      const fallbackQuery = query(
        collection(db, "answers"),
        where("questionId", "==", questionId)
      )
      const fallbackSnapshot = await getDocs(fallbackQuery)
      const answers = fallbackSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      
      // Sort client-side
      return answers.sort((a: any, b: any) => {
        // Accepted answers always come first
        if (a.isAccepted && !b.isAccepted) return -1
        if (!a.isAccepted && b.isAccepted) return 1
        
        // If both are accepted or both are not accepted, sort by votes
        const aVotes = (a.upvotes || 0) - (a.downvotes || 0)
        const bVotes = (b.upvotes || 0) - (b.downvotes || 0)
        if (aVotes !== bVotes) return bVotes - aVotes
        
        // Finally sort by creation date (newer first)
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0
        return bTime - aTime
      })
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError)
      throw fallbackError
    }
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

    await batch.commit()

    // Update user accepted answer count and award karma
    await updateUserAcceptedAnswerCount(authorId)

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
    // Don't throw error to prevent blocking main operations
    console.warn("Notification creation failed, but continuing with main operation")
  }
}

export const getUserNotifications = async (userId: string) => {
  try {
    // Simple query without ordering to avoid index requirement for now
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      limit(20),
    )
    const querySnapshot = await getDocs(q)
    const notifications = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    
    // Sort manually to avoid composite index requirement
    return notifications.sort((a: any, b: any) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error("Error getting notifications:", error)
    // Return empty array instead of throwing to prevent blocking
    return []
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

// User statistics operations
export const updateUserQuestionCount = async (userId: string, questionId: string) => {
  try {
    const userRef = doc(db, "users", userId)

    // Use a batch to ensure atomicity
    const batch = writeBatch(db)

    // Increment questions count
    batch.update(userRef, {
      questionsCount: increment(1),
      questionIds: arrayUnion(questionId),
      updatedAt: serverTimestamp(),
    })

    await batch.commit()

    // Award karma for asking a question
    await updateUserKarma(userId, 5, "Asked a question")

    console.log(`Updated question count for user ${userId}, question ${questionId}`)
  } catch (error) {
    console.error("Error updating user question count:", error)
    throw error
  }
}

export const updateUserAnswerCount = async (userId: string, answerId: string) => {
  try {
    const userRef = doc(db, "users", userId)

    // Use a batch to ensure atomicity
    const batch = writeBatch(db)

    // Increment answers count
    batch.update(userRef, {
      answersCount: increment(1),
      answerIds: arrayUnion(answerId),
      updatedAt: serverTimestamp(),
    })

    await batch.commit()

    // Award karma for providing an answer
    await updateUserKarma(userId, 10, "Provided an answer")

    console.log(`Updated answer count for user ${userId}, answer ${answerId}`)
  } catch (error) {
    console.error("Error updating user answer count:", error)
    throw error
  }
}

export const updateUserAcceptedAnswerCount = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      acceptedAnswers: increment(1),
      updatedAt: serverTimestamp(),
    })

    // Award karma for having an answer accepted
    await updateUserKarma(userId, 25, "Answer was accepted")

    console.log(`Updated accepted answer count for user ${userId}`)
  } catch (error) {
    console.error("Error updating user accepted answer count:", error)
    throw error
  }
}

export const updateUserKarma = async (userId: string, points: number, reason: string) => {
  try {
    const userRef = doc(db, "users", userId)

    await updateDoc(userRef, {
      karma: increment(points),
      updatedAt: serverTimestamp(),
    })

    // Log karma change for transparency
    await addDoc(collection(db, "karmaHistory"), {
      userId,
      points,
      reason,
      timestamp: serverTimestamp(),
    })

    console.log(`Updated karma for user ${userId}: +${points} points for ${reason}`)
  } catch (error) {
    console.error("Error updating user karma:", error)
    throw error
  }
}

// Initialize user fields if they don't exist
export const initializeUserFields = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const updates: any = {}

      // Initialize missing fields
      if (userData.questionsCount === undefined) updates.questionsCount = 0
      if (userData.answersCount === undefined) updates.answersCount = 0
      if (userData.acceptedAnswers === undefined) updates.acceptedAnswers = 0
      if (userData.questionIds === undefined) updates.questionIds = []
      if (userData.answerIds === undefined) updates.answerIds = []
      if (userData.karma === undefined) updates.karma = 0

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp()
        await updateDoc(userRef, updates)
        console.log(`Initialized missing fields for user ${userId}:`, updates)
      }
    }
  } catch (error) {
    console.error("Error initializing user fields:", error)
    throw error
  }
}

// Migration utility to update existing users with new fields
export const migrateUserData = async () => {
  try {
    console.log("Starting user data migration...")
    
    const usersQuery = query(collection(db, "users"))
    const usersSnapshot = await getDocs(usersQuery)
    
    const batch = writeBatch(db)
    let updateCount = 0
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const updates: any = {}
      
      // Initialize missing fields
      if (userData.questionsCount === undefined) updates.questionsCount = 0
      if (userData.answersCount === undefined) updates.answersCount = 0
      if (userData.acceptedAnswers === undefined) updates.acceptedAnswers = 0
      if (userData.questionIds === undefined) updates.questionIds = []
      if (userData.answerIds === undefined) updates.answerIds = []
      if (userData.karma === undefined) updates.karma = 0
      
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp()
        batch.update(userDoc.ref, updates)
        updateCount++
        
        console.log(`Migrating user ${userDoc.id}:`, Object.keys(updates))
      }
    }
    
    if (updateCount > 0) {
      await batch.commit()
      console.log(`Migration completed: ${updateCount} users updated`)
    } else {
      console.log("Migration completed: No users needed updates")
    }
    
    return updateCount
  } catch (error) {
    console.error("Error during user data migration:", error)
    throw error
  }
}

// Utility to populate questionIds and answerIds for existing users
export const populateUserContentIds = async () => {
  try {
    console.log("Starting user content ID population...")
    
    const usersQuery = query(collection(db, "users"))
    const usersSnapshot = await getDocs(usersQuery)
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id
      
      // Get user's questions
      const questionsQuery = query(
        collection(db, "questions"),
        where("authorId", "==", userId)
      )
      const questionsSnapshot = await getDocs(questionsQuery)
      const questionIds = questionsSnapshot.docs.map(doc => doc.id)
      
      // Get user's answers
      const answersQuery = query(
        collection(db, "answers"),
        where("authorId", "==", userId)
      )
      const answersSnapshot = await getDocs(answersQuery)
      const answerIds = answersSnapshot.docs.map(doc => doc.id)
      
      // Update user with actual counts and IDs
      const updates: any = {
        questionsCount: questionIds.length,
        answersCount: answerIds.length,
        questionIds: questionIds,
        answerIds: answerIds,
        updatedAt: serverTimestamp(),
      }
      
      await updateDoc(userDoc.ref, updates)
      console.log(`Populated content IDs for user ${userId}: ${questionIds.length} questions, ${answerIds.length} answers`)
    }
    
    console.log("Content ID population completed")
  } catch (error) {
    console.error("Error during content ID population:", error)
    throw error
  }
}

// Get comprehensive user statistics
export const getUserStats = async (userId: string) => {
  try {
    // Get user profile for basic stats
    const userProfile = await getUserProfile(userId)
    
    // Get questions count
    const questionsQuery = query(collection(db, "questions"), where("authorId", "==", userId))
    const questionsSnapshot = await getDocs(questionsQuery)
    const questionsCount = questionsSnapshot.size
    
    // Get answers count
    const answersQuery = query(collection(db, "answers"), where("authorId", "==", userId))
    const answersSnapshot = await getDocs(answersQuery)
    const answersCount = answersSnapshot.size
    
    // Get accepted answers count
    const acceptedAnswersQuery = query(
      collection(db, "answers"), 
      where("authorId", "==", userId),
      where("isAccepted", "==", true)
    )
    const acceptedAnswersSnapshot = await getDocs(acceptedAnswersQuery)
    const acceptedAnswers = acceptedAnswersSnapshot.size
    
    return {
      questionsCount,
      answersCount,
      acceptedAnswers,
      karma: (userProfile as any)?.karma || 0,
      badges: (userProfile as any)?.badges || [],
      followerCount: (userProfile as any)?.followerCount || 0,
      followingCount: (userProfile as any)?.followingCount || 0,
    }
  } catch (error) {
    console.error("Error getting user stats:", error)
    return {
      questionsCount: 0,
      answersCount: 0,
      acceptedAnswers: 0,
      karma: 0,
      badges: [],
      followerCount: 0,
      followingCount: 0,
    }
  }
}

// Get user's questions using stored question IDs
export const getUserQuestions = async (userId: string) => {
  try {
    const userProfile = await getUserProfile(userId)
    const questionIds = (userProfile as any)?.questionIds || []
    
    if (questionIds.length === 0) {
      return []
    }
    
    // Fetch questions using their IDs
    const questions = await Promise.all(
      questionIds.map(async (questionId: string) => {
        try {
          const question = await getQuestion(questionId)
          return question
        } catch (error) {
          console.error(`Error fetching question ${questionId}:`, error)
          return null
        }
      })
    )
    
    // Filter out null results and sort by creation date (newest first)
    return questions
      .filter(question => question !== null)
      .sort((a, b) => {
        const aTime = a?.createdAt?.toDate?.() || new Date(0)
        const bTime = b?.createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })
  } catch (error) {
    console.error("Error getting user questions:", error)
    return []
  }
}

// Get user's answers using stored answer IDs with question details
export const getUserAnswers = async (userId: string) => {
  try {
    const userProfile = await getUserProfile(userId)
    const answerIds = (userProfile as any)?.answerIds || []
    
    if (answerIds.length === 0) {
      return []
    }
    
    // Fetch answers using their IDs
    const answers = await Promise.all(
      answerIds.map(async (answerId: string) => {
        try {
          // Get the answer document
          const answerDoc = await getDoc(doc(db, "answers", answerId))
          if (!answerDoc.exists()) {
            return null
          }
          
          const answerData = { id: answerDoc.id, ...answerDoc.data() }
          
          // Get the corresponding question
          try {
            const question = await getQuestion((answerData as any).questionId)
            return {
              ...answerData,
              questionTitle: (question as any)?.title || "Question not found",
              questionData: question
            }
          } catch (error) {
            console.error(`Error fetching question for answer ${answerId}:`, error)
            return {
              ...answerData,
              questionTitle: "Question not found",
              questionData: null
            }
          }
        } catch (error) {
          console.error(`Error fetching answer ${answerId}:`, error)
          return null
        }
      })
    )
    
    // Filter out null results and sort by creation date (newest first)
    return answers
      .filter(answer => answer !== null)
      .sort((a, b) => {
        const aTime = a?.createdAt?.toDate?.() || new Date(0)
        const bTime = b?.createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime()
      })
  } catch (error) {
    console.error("Error getting user answers:", error)
    return []
  }
}
