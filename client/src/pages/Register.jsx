import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: true,
    theme: "dark",
    style: { background: "#000", color: "#fff", border: "1px solid #333" }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      try {
        const { password, username, email } = values;
        
        const { data } = await axios.post("http://localhost:3000/api/auth/register", {
          username,
          email,
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
        toast.error("Could not connect to the server.", toastOptions);
      }
    }
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", toastOptions);
      return false;
    } else if (username.length < 3) {
      toast.error("Username must be at least 3 characters.", toastOptions);
      return false;
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters.", toastOptions);
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
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
            <p className="text-zinc-500 text-sm">Create an account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Username"
                name="username"
                autoComplete="off"
                onChange={handleChange}
                className="bg-black text-white px-0 py-3 border-b border-zinc-800 focus:outline-none focus:border-white transition-colors placeholder-zinc-600 w-full"
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                autoComplete="off"
                onChange={handleChange}
                className="bg-black text-white px-0 py-3 border-b border-zinc-800 focus:outline-none focus:border-white transition-colors placeholder-zinc-600 w-full"
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={handleChange}
                className="bg-black text-white px-0 py-3 border-b border-zinc-800 focus:outline-none focus:border-white transition-colors placeholder-zinc-600 w-full"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                onChange={handleChange}
                className="bg-black text-white px-0 py-3 border-b border-zinc-800 focus:outline-none focus:border-white transition-colors placeholder-zinc-600 w-full"
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-white text-black py-4 rounded font-medium text-sm hover:bg-zinc-200 transition-colors mt-6"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-8 text-zinc-600 text-sm">
            Already have an account? 
            <Link to="/login" className="text-white hover:underline ml-2">
              Log in
            </Link>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}