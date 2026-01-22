import React, { useState, useRef } from "react";
import { IoMdSend } from "react-icons/io";

// 1. Accept the necessary props from ChatContainer
export default function ChatInput({ handleSendMsg, socket, currentChat, currentUser }) {
  const [msg, setMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // 2. Use useRef for the timeout so it persists across re-renders
  const typingTimeoutRef = useRef(null);

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");

      // Stop typing immediately when message is sent
      if (socket.current) {
        socket.current.emit("stop-typing", {
          to: currentChat._id,
          from: currentUser._id,
        });
      }
      setIsTyping(false);
    }
  };

  const handlechange = (e) => {
    setMsg(e.target.value);

    // Only emit "typing" once when the user starts typing
    if (!isTyping && socket.current) {
      setIsTyping(true);
      socket.current.emit("typing", {
        to: currentChat._id,
        from: currentUser._id,
      });
    }

    // Debounce: Clear previous timer and start a new one
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (socket.current) {
        socket.current.emit("stop-typing", {
          to: currentChat._id,
          from: currentUser._id,
        });
      }
      setIsTyping(false);
    }, 2000); // 2 seconds of no typing triggers stop-typing
  };

  return (
    <div className="bg-zinc-900 px-8 py-4 border-t border-zinc-800">
      <form className="flex items-center gap-4" onSubmit={(e) => sendChat(e)}>
        <input
          type="text"
          placeholder="Type your message here..."
          className="w-full bg-zinc-800 text-white border-none rounded-lg py-3 px-6 focus:outline-none focus:ring-1 focus:ring-white transition-all"
          value={msg}
          // 3. Make sure to call handlechange here!
          onChange={handlechange} 
        />
        <button type="submit" className="bg-white text-black p-3 rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center">
          <IoMdSend className="text-xl" />
        </button>
      </form>
    </div>
  );
}