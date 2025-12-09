# 🚀 Local Job Board Platform (MERN Stack)

A full-stack freelance marketplace that connects local Clients with Freelancers. The platform allows users to post jobs, apply with proposals, manage applications, and communicate in real-time via a built-in chat system.

## ✨ Features

### 👤 User Roles
* **Client:** Can post new jobs, view applicants, accept/reject proposals, and chat with freelancers.
* **Freelancer:** Can browse the job feed, view job details, apply with cover letters, and chat with clients.

### 💼 Job Management
* **Post Jobs:** Clients can create detailed job listings with budget, category, and deadline.
* **Job Feed:** Freelancers see a dynamic list of available jobs.
* **Application System:** Freelancers can submit proposals; Clients can track status (Pending/Accepted/Rejected).

### 💬 Real-Time Communication
* **Instant Chat:** Powered by **Socket.io**, messages are delivered instantly without refreshing.
* **Inbox System:** Users have a dedicated inbox to see all their active conversations.
* **Persistent History:** Chat history is stored in MongoDB so messages are never lost.

---

## 🛠️ Tech Stack

### Frontend
* **React.js (Vite):** Fast and modern UI library.
* **Tailwind CSS:** For responsive and clean styling.
* **Context API:** For global state management (User Auth).
* **Socket.io Client:** For real-time bi-directional communication.

### Backend
* **Node.js & Express.js:** RESTful API server.
* **MongoDB & Mongoose:** NoSQL database for flexible data storage.
* **Socket.io:** Handles real-time event-based communication.
* **
