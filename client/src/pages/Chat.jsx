import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatContainer from "../components/ChatContainer"; 
import { io } from "socket.io-client";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();

  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);

  // 1. Auth Check
  useEffect(() => {
    const checkUser = async () => {
      const user = localStorage.getItem("chat-app-user");
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(user));
      }
    };
    checkUser();
  }, [navigate]);

  // 2. Initialize Socket
  useEffect(() => {
    if (currentUser) {
      socket.current = io(import.meta.env.VITE_API_URL);
      socket.current.emit("add-user", currentUser._id);
      console.log("Socket connected for:", currentUser.username);
    }
  }, [currentUser]);

  // 3. Get Contacts
  useEffect(() => {
    const getContacts = async () => {
      if (currentUser) {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/allusers/${currentUser._id}`);
        setContacts(data);
      }
    };
    getContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex justify-center items-center overflow-hidden">
      {/* MODIFIED: Changed from fixed grid to flex-col. 
          Uses 'md:grid' to restore the desktop layout on larger screens.
      */}
      <div className="h-full w-full md:h-[90vh] md:w-[90vw] bg-zinc-900 flex flex-col md:grid md:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] md:border md:border-zinc-800 md:rounded-2xl overflow-hidden shadow-2xl">
        
        {/* SIDEBAR: 
            Hidden on mobile if a chat is active (currentChat is set).
            Always visible on medium screens and up.
        */}
        <div className={`${currentChat ? "hidden" : "flex"} md:flex border-r border-zinc-800 flex-col bg-black/40 h-full overflow-hidden`}>
          <div className="p-6 md:p-8 border-b border-zinc-800 shrink-0">
            <h1 className="text-2xl font-bold tracking-tighter">echo.</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
            {contacts.map((contact) => (
              <div 
                key={contact._id} 
                onClick={() => handleChatChange(contact)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                  currentChat?._id === contact._id 
                  ? "bg-white text-black border-white" 
                  : "bg-zinc-800/20 border-transparent hover:bg-zinc-800"
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  currentChat?._id === contact._id ? "bg-black text-white" : "bg-white text-black"
                }`}>
                  {contact.username[0].toUpperCase()}
                </div>
                <span className="font-medium tracking-tight truncate">{contact.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CHAT AREA: 
            Hidden on mobile if no chat is selected.
            Always visible on medium screens and up.
        */}
        <div className={`${!currentChat ? "hidden" : "flex"} md:flex h-full flex-col overflow-hidden bg-zinc-950`}>
          {currentChat === undefined ? (
            <Welcome currentUser={currentUser} />
          ) : (
            /* Pass setCurrentChat to Container so we can have a "Back" button on mobile 
            */
            <ChatContainer 
                currentChat={currentChat} 
                currentUser={currentUser} 
                socket={socket} 
                setCurrentChat={setCurrentChat} 
            />
          )}
        </div>
      </div>
    </div>
  );
}