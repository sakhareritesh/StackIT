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

// Question operations
export const createQuestion = async (questionData: any) => {
  try {
    const docRef = await addDoc(collection(db, "questions"), {
      ...questionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
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

    return docRef.id
  } catch (error) {
    console.error("Error creating answer:", error)
    throw error
  }
}

export const getAnswers = async (questionId: string) => {
  try {
    const q = query(collection(db, "answers"), where("questionId", "==", questionId), orderBy("createdAt", "desc"))
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
    })

    await batch.commit()
  } catch (error) {
    console.error("Error accepting answer:", error)
    throw error
  }
}

// Vote operations
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

// Bookmark operations
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
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    throw error
  }
}

// Follow operations
export const followUser = async (followerId: string, followingId: string) => {
  try {
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
  } catch (error) {
    console.error("Error following user:", error)
    throw error
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
