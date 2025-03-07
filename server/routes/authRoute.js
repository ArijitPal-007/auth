import express from "express"
import { isAuthenticated, ResetOtp, resetPass, sendVerifyOtp, userLogin, userLogout, userRegister, verifyAccount } from "../controllers/auth.js"
import userAuth from "../middleware/userAuth.js"

const userRouter = express.Router()

userRouter.post("/register",userRegister)
userRouter.post("/login",userLogin)
userRouter.post("/logout",userLogout)
userRouter.post("/send-verify-otp",userAuth,sendVerifyOtp)
userRouter.post("/verify-account",userAuth,verifyAccount)
userRouter.post("/isAuth",userAuth,isAuthenticated)
userRouter.post("/send-reset-otp",ResetOtp)
userRouter.post("/reset-pass",resetPass)

export default userRouter;