import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";

export default function ChatContainer({ currentChat, currentUser, socket, setCurrentChat }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isRemoteUserTyping, setIsRemoteUserTyping] = useState(false); // Renamed for clarity
  const scrollRef = useRef();

  // 1. Fetch History
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

  // 2. Send Message
  const handleSendMsg = async (msg) => {
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

  // 3. Socket Listener for Incoming Messages
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

  // 4. Socket Listeners for Typing Indicator
  useEffect(() => {
    if (socket.current) {
      socket.current.on("typing", (data) => {
        if (currentChat._id === data.from) {
          setIsRemoteUserTyping(true);
        }
      });
      socket.current.on("stop-typing", (data) => {
        if (currentChat._id === data.from) {
          setIsRemoteUserTyping(false);
        }
      });
    }
    return () => {
      if (socket.current) {
        socket.current.off("typing");
        socket.current.off("stop-typing");
      }
    };
  }, [currentChat, socket]);

  // 5. Handle Message Arrival & Auto Scroll
  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper function to format Last Seen time
  const formatLastSeen = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Back Button (Mobile) */}
          <button 
            onClick={() => setCurrentChat(undefined)} 
            className="md:hidden text-white hover:text-zinc-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center font-bold shrink-0">
            {currentChat.username[0].toUpperCase()}
          </div>

          {/* User Info & Dynamic Status */}
         <div className="flex flex-col">
  <h3 className="font-bold text-lg tracking-tight leading-tight">
    {currentChat.username}
  </h3>
  
  <p className="text-[10px] md:text-xs font-medium">
    {isRemoteUserTyping ? (
      // Typing is now grey
      <span className="text-zinc-500 italic">typing...</span>
    ) : currentChat.isOnline ? (
      // Online stays green
      <span className="text-green-500">Online</span>
    ) : currentChat.lastSeen ? (
      // Last seen is grey
      <span className="text-zinc-500">
        Last seen at {formatLastSeen(currentChat.lastSeen)}
      </span>
    ) : (
      ""
    )}
  </p>
</div>
        </div>
        <Logout socket={socket} />
      </div>

      {/* MESSAGES */}
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

      <div className="shrink-0 bg-zinc-950 p-2 md:p-0">
        <ChatInput 
          handleSendMsg={handleSendMsg} 
          socket={socket} 
          currentChat={currentChat} 
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
}