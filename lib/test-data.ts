import { collection, addDoc, doc, setDoc } from "firebase/firestore"
import { db } from "./firebase"

export const createTestUsers = async () => {
  const testUsers = [
    {
      username: "Vedant Harshad Deore",
      email: "vedant@example.com",
      karma: 150,
      questionsCount: 3,
      answersCount: 8,
      acceptedAnswers: 2,
      badges: ["contributor", "helper"],
      role: "admin",
      createdAt: new Date(),
      avatar: "",
      isBanned: false,
      bio: "Full-stack developer passionate about React and Node.js"
    },
    {
      username: "johndoe",
      email: "john@example.com",
      karma: 1250,
      questionsCount: 15,
      answersCount: 42,
      acceptedAnswers: 18,
      badges: ["helpful", "contributor"],
      role: "user",
      createdAt: new Date(),
      avatar: "",
      isBanned: false,
    },
    {
      username: "janedeveloper",
      email: "jane@example.com", 
      karma: 2100,
      questionsCount: 8,
      answersCount: 67,
      acceptedAnswers: 34,
      badges: ["expert", "mentor", "helpful"],
      role: "user",
      createdAt: new Date(),
      avatar: "",
      isBanned: false,
    },
    {
      username: "codemasterx",
      email: "codemaster@example.com",
      karma: 3450,
      questionsCount: 25,
      answersCount: 98,
      acceptedAnswers: 56,
      badges: ["expert", "mentor", "veteran", "helpful"],
      role: "user", 
      createdAt: new Date(),
      avatar: "",
      isBanned: false,
    },
    {
      username: "technovice",
      email: "novice@example.com",
      karma: 350,
      questionsCount: 12,
      answersCount: 8,
      acceptedAnswers: 3,
      badges: ["newcomer"],
      role: "user",
      createdAt: new Date(),
      avatar: "",
      isBanned: false,
    },
    {
      username: "pythonista",
      email: "python@example.com",
      karma: 1890,
      questionsCount: 6,
      answersCount: 45,
      acceptedAnswers: 22,
      badges: ["python-expert", "helpful"],
      role: "user",
      createdAt: new Date(),
      avatar: "",
    }
  ]

  try {
    for (const user of testUsers) {
      await addDoc(collection(db, "users"), user)
    }
    console.log("Test users created successfully!")
    return true
  } catch (error) {
    console.error("Error creating test users:", error)
    return false
  }
}

export const createTestQuestions = async () => {
  const testQuestions = [
    {
      title: "How to implement authentication in React?",
      content: "I'm trying to add user authentication to my React app. What's the best approach?",
      authorId: "user1",
      authorName: "johndoe",
      tags: ["react", "authentication", "javascript"],
      upvotes: 15,
      downvotes: 2,
      answers: 8,
      createdAt: new Date(),
      isAnswered: true,
    },
    {
      title: "Python vs JavaScript for backend development",
      content: "Which language should I choose for my new web application backend?",
      authorId: "user2", 
      authorName: "janedeveloper",
      tags: ["python", "javascript", "backend", "comparison"],
      upvotes: 23,
      downvotes: 1,
      answers: 12,
      createdAt: new Date(),
      isAnswered: false,
    }
  ]

  try {
    for (const question of testQuestions) {
      await addDoc(collection(db, "questions"), question)
    }
    console.log("Test questions created successfully!")
    return true
  } catch (error) {
    console.error("Error creating test questions:", error)
    return false
  }
}
