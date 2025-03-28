import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");  // Fixed useState for email
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-900 to-purple-800">
      <div className="bg-[#1E293B] p-8 rounded-lg shadow-lg w-96 text-white">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <p className="text-center text-gray-300">Enter your email to receive OTP</p>

        <form className="mt-6 space-y-4">
          <div className="input-group">
            <img src={assets.mail_icon} alt="Email" className="w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              className="input-field"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <button className="btn w-full">
            Send OTP
          </button>

          <p onClick={() => navigate("/")} className="text-indigo-500 cursor-pointer text-center mt-3">
            Back to Login
          </p>
        </form>
        <form >
          
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
