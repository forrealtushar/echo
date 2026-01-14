import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  // Fetch History
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.post("http://localhost:3000/api/messages/getmsg", {
        from: currentUser._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    };
    if (currentChat) fetchMessages();
  }, [currentChat, currentUser]);

  // Send Message
  const handleSendMsg = async (msg) => {
    await axios.post("http://localhost:3000/api/messages/addmsg", {
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
      
      {/* HEADER - Fixed */}
      <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
            {currentChat.username[0].toUpperCase()}
          </div>
          <h3 className="font-bold text-lg tracking-tight">{currentChat.username}</h3>
        </div>
        <Logout socket={socket} />
      </div>

      {/* MESSAGES - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
        {messages.map((message) => (
          <div ref={scrollRef} key={uuidv4()}>
            <div className={`flex ${message.fromSelf ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                  message.fromSelf
                    ? "bg-white text-black rounded-tr-none"
                    : "bg-zinc-800 text-white rounded-tl-none border border-zinc-700"
                }`}>
                <p>{message.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT - Fixed */}
      <div className="shrink-0 bg-zinc-950">
        <ChatInput handleSendMsg={handleSendMsg} />
      </div>
    </div>
  );
}