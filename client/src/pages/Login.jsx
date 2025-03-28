import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function Login() {
  const { backendUrl, setIsLoggedin,getUser } = useContext(AppContext);
  const [state, setState] = useState("signUp");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onsubmitHandler = async (e) => {
    // console.log("backend",backendUrl);
    
    e.preventDefault(); // Fixed typo

    try {
      axios.defaults.withCredentials = true;

      if (state === "signUp") { // Fixed string comparison
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          await getUser()
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          await getUser()
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-900 to-purple-800">
      <div className="bg-[#1E293B] p-8 rounded-lg shadow-lg w-96 text-white relative">
        <h2 className="text-2xl font-bold text-center">
          {state === "signUp" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-gray-300">
          {state === "signUp" ? "Create your account" : "Login to your account"}
        </p>

        <form className="mt-6 space-y-4" onSubmit={(e) => onsubmitHandler(e)}>
          {state === "signUp" && (
            <div className="input-group">
              <img src={assets.person_icon} alt="User" className="w-5 h-5" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Full Name"
                required
                className="input-field"
              />
            </div>
          )}
          <div className="input-group">
            <img src={assets.mail_icon} alt="Email" className="w-5 h-5" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="input-field"
            />
          </div>
          <div className="input-group">
            <img src={assets.lock_icon} alt="Password" className="w-5 h-5" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className="input-field"
            />
          </div>

          <button className="btn w-full">
            {state === "signUp" ? "Sign Up" : "Login"}
          </button>

          <p
            onClick={() => navigate("/reset-password")}
            className="text-indigo-500 cursor-pointer text-center"
          >
            Forgot Password?
          </p>
        </form>

        <p className="text-center mt-4 text-gray-300">
          {state === "signUp"
            ? "Already have an account?"
            : "Don't have an account?"}
          <button
            onClick={() => setState(state === "signUp" ? "login" : "signUp")}
            className="text-blue-400 ml-1"
          >
            {state === "signUp" ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
