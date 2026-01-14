import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg(""); // Clear input after sending
    }
  };

  return (
    <div className="bg-zinc-900 px-8 py-4 border-t border-zinc-800">
      <form className="flex items-center gap-4" onSubmit={(e) => sendChat(e)}>
        <input
          type="text"
          placeholder="Type your message here..."
          className="w-full bg-zinc-800 text-white border-none rounded-lg py-3 px-6 focus:outline-none focus:ring-1 focus:ring-white transition-all"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button type="submit" className="bg-white text-black p-3 rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center">
          <IoMdSend className="text-xl" />
        </button>
      </form>
    </div>
  );
}