import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export const createTestUsers = async () => {
  const testUsers = [
    {
      uid: "test-user-1",
      username: "johndoe",
      email: "john@example.com",
      karma: 1250,
      questionsCount: 15,
      answersCount: 42,
      acceptedAnswers: 18,
      badges: ["helpful", "contributor"],
      questionIds: [],
      answerIds: [],
      role: "user",
      bio: "Experienced developer specializing in web technologies",
      avatar: "",
      bookmarks: [],
      followerCount: 12,
      followingCount: 8,
      isBanned: false,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        answerNotifications: true,
        commentNotifications: true,
        weeklyDigest: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      uid: "test-user-2",
      username: "janedeveloper",
      email: "jane@example.com", 
      karma: 2100,
      questionsCount: 8,
      answersCount: 67,
      acceptedAnswers: 34,
      badges: ["expert", "mentor", "helpful"],
      questionIds: [],
      answerIds: [],
      role: "user",
      bio: "Senior software engineer with expertise in React and Node.js",
      avatar: "",
      bookmarks: [],
      followerCount: 25,
      followingCount: 15,
      isBanned: false,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        answerNotifications: true,
        commentNotifications: true,
        weeklyDigest: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      uid: "test-user-3",
      username: "codemasterx",
      email: "codemaster@example.com",
      karma: 3450,
      questionsCount: 25,
      answersCount: 98,
      acceptedAnswers: 56,
      badges: ["expert", "mentor", "veteran", "helpful"],
      questionIds: [],
      answerIds: [],
      role: "admin", 
      bio: "Full-stack architect and community leader",
      avatar: "",
      bookmarks: [],
      followerCount: 45,
      followingCount: 20,
      isBanned: false,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        answerNotifications: true,
        commentNotifications: true,
        weeklyDigest: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      uid: "test-user-4",
      username: "technovice",
      email: "novice@example.com",
      karma: 350,
      questionsCount: 12,
      answersCount: 8,
      acceptedAnswers: 3,
      badges: ["newcomer"],
      questionIds: [],
      answerIds: [],
      role: "user",
      bio: "Learning to code and asking lots of questions",
      avatar: "",
      bookmarks: [],
      followerCount: 5,
      followingCount: 3,
      isBanned: false,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: false,
        answerNotifications: true,
        commentNotifications: false,
        weeklyDigest: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      uid: "test-user-5",
      username: "pythonista",
      email: "python@example.com",
      karma: 1890,
      questionsCount: 6,
      answersCount: 45,
      acceptedAnswers: 22,
      badges: ["python-expert", "helpful"],
      questionIds: [],
      answerIds: [],
      role: "user",
      bio: "Python enthusiast and data science practitioner",
      avatar: "",
      bookmarks: [],
      followerCount: 18,
      followingCount: 10,
      isBanned: false,
      notificationSettings: {
        emailNotifications: true,
        pushNotifications: true,
        answerNotifications: true,
        commentNotifications: true,
        weeklyDigest: false
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  ]

  try {
    for (const user of testUsers) {
      await setDoc(doc(db, "users", user.uid), user)
      console.log(`Created test user: ${user.username}`)
    }
    console.log("Test users created successfully!")
    return testUsers.length
  } catch (error) {
    console.error("Error creating test users:", error)
    throw error
  }
}

export const createTestQuestions = async () => {
  const testQuestions = [
    {
      title: "How to implement authentication in React?",
      content: "I'm trying to add user authentication to my React app. What's the best approach for handling user sessions and protecting routes?",
      authorId: "test-user-1",
      tags: ["react", "authentication", "javascript", "security"],
      votes: 15,
      views: 234,
      answerCount: 8,
      isAnswered: true,
      acceptedAnswerId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      title: "Python vs JavaScript for backend development",
      content: "Which language should I choose for my new web application backend? I'm considering scalability, performance, and developer ecosystem.",
      authorId: "test-user-2", 
      tags: ["python", "javascript", "backend", "comparison", "nodejs"],
      votes: 23,
      views: 456,
      answerCount: 12,
      isAnswered: false,
      acceptedAnswerId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      title: "Best practices for MongoDB schema design",
      content: "I'm designing a database schema for a social media application. What are the best practices for MongoDB document structure and relationships?",
      authorId: "test-user-3",
      tags: ["mongodb", "database", "schema-design", "nosql"],
      votes: 18,
      views: 312,
      answerCount: 6,
      isAnswered: true,
      acceptedAnswerId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  ]

  try {
    const createdQuestions = []
    for (const question of testQuestions) {
      const docRef = await addDoc(collection(db, "questions"), question)
      createdQuestions.push({ id: docRef.id, ...question })
      console.log(`Created test question: ${question.title}`)
    }
    console.log("Test questions created successfully!")
    return createdQuestions
  } catch (error) {
    console.error("Error creating test questions:", error)
    throw error
  }
}
