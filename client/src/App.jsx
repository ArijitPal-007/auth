import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import EmailVerify from "./pages/EmailVerify.jsx"
import ResetPass from './pages/ResetPass.jsx'
import { ToastContainer, toast } from 'react-toastify';

function App() {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPass/>}/>
      </Routes>
    </div>
  )
}

export default App
