import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";

export default function Logout({ socket }) {
  const navigate = useNavigate();
  const handleClick = async () => {
    if (socket.current) {
      socket.current.disconnect();
    }
    localStorage.clear();
    navigate("/login");
  };
  return (
    <button onClick={handleClick} className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:bg-red-900/20 hover:border-red-900 transition-all">
      <BiPowerOff />
    </button>
  );
}