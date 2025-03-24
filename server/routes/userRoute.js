import express from "express"
import { userDetails } from "../controllers/userController.js"
import userAuth from "../middleware/userAuth.js"

const userRoute = express.Router()

userRoute.get("/userDetails",userAuth,userDetails)

export default userRoute