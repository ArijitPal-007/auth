import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/auth`)
        console.log("mongodb connected");
        
    } catch (error) {
        console.log("mongodb got an error");
        
    }
}

export default connectDB;