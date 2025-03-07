import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRouter from "./routes/authRoute.js";


const app = express();
const port = 8000;

connectDB()

app.use(express.json());
app.use(cors({credentials: true,}))
app.use(cookieParser());

app.use("/api/auth",userRouter)

app.get("/",(req,res)=>{
    res.send("hello Non.....")
})

app.listen(port,()=>{
    console.log("server is listen..");
})
