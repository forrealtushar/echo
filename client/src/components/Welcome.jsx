import React from "react";

export default function Welcome({ currentUser }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-zinc-900/50">
      <div className="space-y-4">
        <h2 className="text-5xl font-bold tracking-tighter">
          Hello, <span className="text-zinc-500">{currentUser?.username}!</span>
        </h2>
        <p className="text-zinc-400 text-lg">Pick a friend and start echoing.</p>
      </div>
    </div>
  );
}