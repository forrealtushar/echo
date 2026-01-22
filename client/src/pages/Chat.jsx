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

 // 2. Initialize Socket (Runs only once when currentUser is found)
  useEffect(() => {
    if (currentUser) {
      const host = import.meta.env.VITE_API_URL;
      if (host) {
        // Prevent multiple connections
        if (!socket.current) {
          socket.current = io(host, {
            transports: ["websocket"], // Forces WebSocket to prevent polling errors
          });
          socket.current.emit("add-user", currentUser._id);
        }
      }
    }
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [currentUser]);

  // 2b. Socket Listeners (Handles real-time updates without reconnecting)
  useEffect(() => {
    if (socket.current) {
      // Initial list
      socket.current.on("get-online-users", (onlineUserIds) => {
        setContacts((prev) =>
          prev.map((contact) => ({
            ...contact,
            isOnline: onlineUserIds.includes(contact._id),
          }))
        );
      });

      // Status changes
      socket.current.on("user-status-change", ({ userId, isOnline, lastSeen }) => {
        setContacts((prev) =>
          prev.map((contact) =>
            contact._id === userId ? { ...contact, isOnline, lastSeen } : contact
          )
        );
        
        // Use functional update for currentChat to avoid dependency loop
        setCurrentChat((prev) => {
          if (prev?._id === userId) {
            return { ...prev, isOnline, lastSeen };
          }
          return prev;
        });
      });
    }

    // Cleanup listeners to prevent duplicates
    return () => {
      if (socket.current) {
        socket.current.off("get-online-users");
        socket.current.off("user-status-change");
      }
    };
  }, [contacts]); // Only refresh listeners if contacts list fundamentally changes

  // 3. Get Contacts
  useEffect(() => {
    const getContacts = async () => {
      if (currentUser) {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/allusers/${currentUser._id}`);
          setContacts(data);
        } catch (error) {
          console.error("Error fetching contacts:", error);
        }
      }
    };
    getContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex justify-center items-center overflow-hidden">
      <div className="h-full w-full md:h-[90vh] md:w-[90vw] bg-zinc-900 flex flex-col md:grid md:grid-cols-[30%_70%] lg:grid-cols-[25%_75%] md:border md:border-zinc-800 md:rounded-2xl overflow-hidden shadow-2xl">
        
        {/* SIDEBAR */}
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
                <div className="relative shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    currentChat?._id === contact._id ? "bg-black text-white" : "bg-white text-black"
                  }`}>
                    {contact.username[0].toUpperCase()}
                  </div>
                  {/* Real-time Green Dot */}
                  {contact.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-zinc-900 rounded-full"></span>
                  )}
                </div>
                
                <span className="font-medium tracking-tight truncate">{contact.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className={`${!currentChat ? "hidden" : "flex"} md:flex h-full flex-col overflow-hidden bg-zinc-950`}>
          {currentChat === undefined ? (
            <Welcome currentUser={currentUser} />
          ) : (
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