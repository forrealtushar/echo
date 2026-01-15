import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";

// 1. Destructure setCurrentChat from props
export default function ChatContainer({ currentChat, currentUser, socket, setCurrentChat }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  // Fetch History
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/getmsg`, {
        from: currentUser._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    };
    if (currentChat) fetchMessages();
  }, [currentChat, currentUser]);

  // Send Message
  const handleSendMsg = async (msg) => {
    // FIX: Changed endpoint from getmsg to addmsg
    await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/addmsg`, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });

    setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);
  };

  // Socket Listener
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
    return () => {
      if (socket.current) socket.current.off("msg-recieve");
    };
  }, [socket]);

  // Handle Arrival
  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  // Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* HEADER - Updated for responsiveness */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* 2. MOBILE BACK BUTTON: Only visible on small screens (hidden on md) */}
          <button 
            onClick={() => setCurrentChat(undefined)} 
            className="md:hidden text-white hover:text-zinc-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center font-bold shrink-0">
            {currentChat.username[0].toUpperCase()}
          </div>
          <h3 className="font-bold text-lg tracking-tight truncate max-w-[150px] md:max-w-none">
            {currentChat.username}
          </h3>
        </div>
        <Logout socket={socket} />
      </div>

      {/* MESSAGES - Updated padding for mobile */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 hide-scrollbar">
        {messages.map((message) => (
          <div ref={scrollRef} key={uuidv4()}>
            <div className={`flex ${message.fromSelf ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                  message.fromSelf
                    ? "bg-white text-black rounded-tr-none"
                    : "bg-zinc-800 text-white rounded-tl-none border border-zinc-700"
                }`}>
                <p className="leading-relaxed">{message.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT - Fixed */}
      <div className="shrink-0 bg-zinc-950 p-2 md:p-0">
        <ChatInput handleSendMsg={handleSendMsg} />
      </div>
    </div>
  );
}