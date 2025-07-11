# 💬 Real-Time Chat Application

A full-stack real-time chat platform built with **React**, **Spring Boot**, and **MongoDB Atlas**, deployed on **Render**. Users can create and join chat rooms, send real-time messages, and experience seamless communication through a clean and interactive UI.

> 🚀 Live Demo: [https://real-time-chat-apk-4.onrender.com](https://real-time-chat-apk-4.onrender.com)

---

## 🛠️ Tech Stack

### 🔹 Frontend
- **Vite + React**
- Axios for HTTP requests
- Socket.IO for real-time messaging
- Tailwind CSS (if used) or plain CSS

### 🔹 Backend
- **Spring Boot** (Java)
- WebSocket (for real-time communication)
- MongoDB Atlas (cloud NoSQL database)
- REST APIs for room and message handling
- CORS configured for secure cross-origin requests

### 🔹 Deployment
- Backend: deployed on **Render**
- Frontend: Vite build deployed on **Render**
- Environment Variables managed securely

---

## ✅ Features

- 🔒 Create or join chat rooms with unique IDs
- ⚡ Real-time message updates using WebSocket
- 📜 Message history with pagination
- 🌐 Deployed and accessible from anywhere
- 🎯 Optimized for both development and production

---

## 🧩 Folder Structure

\`\`\`
/Real_time_chat_apk
  ├── chat-apk-backend       # Spring Boot backend
  └── chat-apk-frontend      # Vite + React frontend
\`\`\`

---

## ⚙️ Running Locally

### 1️⃣ Backend Setup

\`\`\`bash
# Set environment variable
Create a .env file with:
MONGO_URI=your_mongo_db_connection_string

# Run the backend
./mvnw spring-boot:run
\`\`\`

### 2️⃣ Frontend Setup

\`\`\`bash
# Navigate to frontend
cd chat-apk-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`

> 📝 Make sure \`baseURL\` in \`AxiosHelper.js\` points to your backend:
> \`\`\`js
> export const baseURL = "http://localhost:8080";
> \`\`\`

---

## 🌐 Environment Variables

Make sure to hide sensitive credentials:

### .env (Backend)
\`\`\`env
MONGO_URI=your_mongo_db_connection_string
\`\`\`

---

## 🚀 Deployment

Both frontend and backend are deployed on **Render**:

- **Backend (Docker)**: Deploy from GitHub → expose port \`8080\` → configure environment variables
- **Frontend (Static Site)**: Set \`baseURL\` to backend URL → build with \`vite\` → deploy \`dist\` folder

---

## 📸 Screenshots

![Chat Room](https://via.placeholder.com/800x400?text=Chat+UI+Screenshot)
*Real-time chat interface (replace with actual screenshot)*

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Tarun Kumar Basera**  
[GitHub](https://github.com/enlighttarunkumar)

---
EOF
