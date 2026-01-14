import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import { Server } from "socket.io"; // Added this import

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth',userRoutes)
app.use("/api/messages", messageRoutes);

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log('DB connection successful')
})
.catch((err)=>{
    console.log(err)
})

app.get('/',(req,res)=>{ 
    res.send('Echo server is running')
})

// Store the server instance in a variable
const server = app.listen(3000, () => {
    console.log("Server started on port 3000");
});

// --- Socket.io Logic Start ---
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Change this if your frontend port is different
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("A user connected to socket:", socket.id); // LOG 1

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is now mapped to socket ${socket.id}`); // LOG 2
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        console.log(`Message from ${data.from} to ${data.to}. Target socket: ${sendUserSocket}`); // LOG 3
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });
});