## 🚀 Overview

StackIt is a minimal question-and-answer platform that supports:
- Collaborative learning
- Structured, searchable discussions
- AI-enhanced tagging and moderation *(optional)*

Built for the **Odoo Hackathon**, StackIt emphasizes real-world usability with clean UI, modular backend, and optional smart features that scale with user growth.

---

## 👥 User Roles

| Role   | Permissions |
|--------|-------------|
| **Guest** | View all questions and answers |
| **User** | Register, log in, post questions & answers, vote |
| **Admin** | Moderate content, manage users & system |

---

## 🧰 Core Features (MVP)

### 1. ✅ Ask Question
- Users can submit new questions with:
  - **Title** – Short and descriptive
  - **Description** – Via a **Rich Text Editor**
  - **Tags** – Multi-select (e.g., `React`, `JWT`, etc.)

### 2. 🖋️ Rich Text Editor
Supports formatting features like:
- **Bold**, *Italic*, ~~Strikethrough~~  
- **Numbered lists** & bullet points  
- 🧑‍🎨 **Emoji** insertion  
- **Hyperlinks**  
- **Image uploads**  
- **Text alignment** (Left, Center, Right)

### 3. 💬 Answering Questions
- Users can post answers with full formatting
- Only logged-in users can answer questions

### 4. 👍 Voting & Accepted Answers
- Users can **upvote** or **downvote** answers
- Question owners can **mark one answer as accepted**

### 5. 🏷️ Tagging
- Questions must include **relevant tags**
- Tags help filter and organize content

### 6. 🔔 Notification System
- A notification bell icon appears in the top navigation bar
- Users are notified when:
  - Someone answers their question
  - Someone comments on their answer
  - Someone mentions them using `@username`
- Notifications are displayed in a dropdown with unread count

---

## 🛡️ Admin Panel Features
Admins can:
- ❌ Reject inappropriate or spammy questions
- 🚫 Ban users who violate platform policies
- 👀 Monitor pending, accepted, or canceled activity
- 📢 Send platform-wide announcements (e.g., downtime alerts)
- 📄 Download reports (user activity, feedback logs, swap stats)

---

## 🖼️ Mockup

Check out the visual layout and flow here:  
🔗 [StackIt Mockup (Excalidraw)](https://link.excalidraw.com/l/65VNwvy7c4X/8bM86GXnnUN)



> 🛠 Built with ❤️ for the **Odoo Hackathon** — because structured knowledge deserves a structured platform.