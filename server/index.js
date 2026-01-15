import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import { Server } from "socket.io";

dotenv.config()
const app = express()

// 1. UPDATED CORS: Add your deployed frontend URL here later
app.use(cors({
    origin: ["http://localhost:5173", "https://your-frontend-link.onrender.com"],
    credentials: true,
}))
app.use(express.json())

app.use('/api/auth', userRoutes)
app.use("/api/messages", messageRoutes);

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('DB connection successful')
})
.catch((err) => {
    console.log("DB Connection Error:", err.message)
})

app.get('/', (req, res) => { 
    res.send('Echo server is running')
})

// 2. DYNAMIC PORT: Essential for Render/Deployment
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// 3. SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://your-frontend-link.onrender.com"],
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        // Broadcast the updated online users list to everyone
        io.emit("get-online-users", Array.from(onlineUsers.keys()));
        console.log(`User ${userId} joined.`);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });

    // 4. DISCONNECT LOGIC: Automatically handles dots turning off
    socket.on("disconnect", () => {
        let disconnectedUserId = null;
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }
        if (disconnectedUserId) {
            console.log(`User ${disconnectedUserId} disconnected.`);
            // Inform everyone that the user list has changed
            io.emit("get-online-users", Array.from(onlineUsers.keys()));
        }
    });
});