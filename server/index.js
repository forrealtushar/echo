import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import { Server } from "socket.io";
import User from "./models/userModel.js"; // IMPORT YOUR USER MODEL

dotenv.config()
const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "https://echo-1-zioj.onrender.com"],
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

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://echo-1-zioj.onrender.com"],
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // 1. UPDATED JOIN LOGIC
    socket.on("add-user", async (userId) => {
        onlineUsers.set(userId, socket.id);
        
        // Update DB: User is now online
        await User.findByIdAndUpdate(userId, { isOnline: true });
        
        // Broadcast the updated online users list to everyone
        io.emit("get-online-users", Array.from(onlineUsers.keys()));
        
        // Notify others specifically for status change (useful for the header)
        socket.broadcast.emit("user-status-change", { userId, isOnline: true });
        
        console.log(`User ${userId} joined.`);
    });

    // Inside your io.on("connection", (socket) => { ... })

    socket.on("typing", (data) => {
    const receiverSocket = onlineUsers.get(data.to);
    if (receiverSocket) {
        socket.to(receiverSocket).emit("typing", { from: data.from });
    }
    });

    socket.on("stop-typing", (data) => {
    const receiverSocket = onlineUsers.get(data.to);
    if (receiverSocket) {
        socket.to(receiverSocket).emit("stop-typing", { from: data.from });
    }
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });

    // 2. UPDATED DISCONNECT LOGIC
    socket.on("disconnect", async () => {
        let disconnectedUserId = null;
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }
        
        if (disconnectedUserId) {
            const lastSeen = new Date();
            
            // Update DB: User is offline, save timestamp
            await User.findByIdAndUpdate(disconnectedUserId, { 
                isOnline: false, 
                lastSeen: lastSeen 
            });

            console.log(`User ${disconnectedUserId} disconnected.`);
            
            // Inform everyone of updated list and last seen time
            io.emit("get-online-users", Array.from(onlineUsers.keys()));
            socket.broadcast.emit("user-status-change", { 
                userId: disconnectedUserId, 
                isOnline: false, 
                lastSeen: lastSeen 
            });
        }
    });
});