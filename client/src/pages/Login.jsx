import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: true,
    theme: "dark",
    style: { background: "#000", color: "#fff", border: "1px solid #333" }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("chat-app-user")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      try {
        const { password, username } = values;
        
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          username,
          password,
        });

        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        }
        if (data.status === true) {
          localStorage.setItem("chat-app-user", JSON.stringify(data.user));
          navigate("/");
        }
      } catch (error) {
        toast.error("Error connecting to server.", toastOptions);
      }
    }
  };

  const handleValidation = () => {
    const { password, username } = values;
    if (password === "" || username === "") {
      toast.error("Username and Password are required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  return (
    <>
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-black">
        <div className="w-full max-w-sm px-4">
          
          <div className="flex flex-col items-start mb-12">
            <h1 className="text-white text-4xl font-semibold tracking-tighter mb-2">echo.</h1>
            <p className="text-zinc-500 text-sm">Login to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Username"
                name="username"
                onChange={handleChange}
                autoComplete="off"
                className="bg-black text-white px-0 py-3 border-b border-zinc-800 focus:outline-none focus:border-white transition-colors placeholder-zinc-600 w-full"
              />
              
              <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={handleChange}
                className="bg-black text-white px-0 py-3 border-b border-zinc-800 focus:outline-none focus:border-white transition-colors placeholder-zinc-600 w-full"
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-white text-black py-4 rounded font-medium text-sm hover:bg-zinc-200 transition-colors mt-6"
            >
              Log In
            </button>
          </form>

          <div className="mt-8 text-zinc-600 text-sm">
            Don't have an account? 
            <Link to="/register" className="text-white hover:underline ml-2">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}