import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";


const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if any field is missing
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, msg: "All fields are required!" });
        }

        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return res.status(400).json({ success: false, msg: "Email already exists!" });
        }

        const hashPass = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashPass });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const mailOptions = {
            from:process.env.SENDER_EMAIL,
            to:email,
            subject:"WelCome to ari website",
            text:"Welcome to ari website. Your account has been created with email id:",email
        }
        await transporter.sendMail(mailOptions)

        return res.status(201).json({ success: true, msg: "User registered successfully!", user });
    } 
    catch (error) {
        console.log("Error in register:", error);
        return res.status(500).json({ success: false, msg: "Error in registration" });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "All fields are required!" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, msg: "Email not found!" });
        }

        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch) {
            return res.status(401).json({ success: false, msg: "Password does not match!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, msg: "Login successful!", token });
    } 
    catch (error) {
        console.log("Error in user login:", error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};


const userLogout = async (req,res)=>{
    try {
        res.clearCookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ?
            "none" : "strict",
            maxAge: 7 * 24 *60 * 60 * 1000
        })
        res.json({success:true,msg:"logout"})
    } catch (error) {
        res.json({msg:"error"})
        console.log("error in log out",error);  
    }
}

const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ msg: "User not found" });
        }

        if (user.isAccountVerified) {
            return res.json({ msg: "Account already verified!"});
        }

        const genOtp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyotp = genOtp;
        user.verifyExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Enter this ${genOtp} OTP to verify your account.`,
        };
        
        await transporter.sendMail(mailOptions);
        res.json({ msg: "OTP sent to your email." });

    } catch (error) {
        res.json({ msg: "Account verification unsuccessful." });
        console.log("Error in verify OTP:", error);
    }
};


const verifyAccount = async (req,res)=>{
   try{
    const {userId,genOtp} = req.body
    if(!userId || !genOtp){
        res.json({msg:"all field required!!"})
    }
    const user = await userModel.findById(userId)
    if(!user){
        res.json({msg:"user not found"})
    }
    if(user.verifyotp === "" || user.verifyotp !== genOtp){
        res.json({msg:"invalid password"})
    }
    if(user.verifyExpireAt<Date.now()){
        res.json({msg:"verify otp expaired"})
    }
    user.isAccountVerified = true
    user.verifyotp=""
    user.verifyExpireAt=0

    await user.save()
    res.json({msg:"account verified"})

    }catch (error) {
    res.json({msg:"verify got an error"})
    console.log("verify acount error",error);
   }
}

const isAuthenticated = async (req,res)=>{
    try {
        res.json({"msg":"Authenticated"})
    } catch (error) {
        console.log("error in isAuthenticated",error);
        res.send("error occur in isAuthenticated")
    }
}

const ResetOtp = async (req,res)=>{
    try{
        const {email} = req.body
        if(!email){
            res.json({msg:"email is required!!"})
        }
        const user = await userModel.findOne({email})
        if(!user){
            res.json({msg:"invalid user!!"})
        }

        const genOtp = String(Math.floor(100000 +Math.random()*900000))
        user.resetotp=genOtp
        user.resetOtpExpireAt=Date.now()+15*60*1000
        await user.save()

         const nodemailers={
            from:process.env.SENDER_EMAIL,
            to:user.email,
            subject:"Send Otp For Reset Your Password",
            text:`enter this ${genOtp} otp,to reast your password`
         }
         await transporter.sendMail(nodemailers)
         res.json({mag:"reset otp send on your email"})
    } catch (error) {
        console.log("reset error is",error);
        res.json({error:error})
    }

}

const resetPass = async (req, res) => {
    try{
        const {email,genOtp,newPass} = req.body
        if(!email || !genOtp || !newPass){
            return res.json({msg:"all field required"})
        }
        const user = await userModel.findOne({email})
        if(!user){
             return res.json({msg:"invalid user"})
        }
        console.log("Stored OTP:", user.resetotp, "Received OTP:", genOtp);

        if(user.resetotp === 0 || user.resetotp !== genOtp){
           return res.json({msg:"invalid otp"})
        }
        if(user.resetOtpExpireAt < Date.now()){
           return res.json({msg:"resetotp expaired"})
        }
        const resetPass = await bcrypt.hash(newPass,10)
        user.password = resetPass
        user.resetotp=""
        user.resetOtpExpireAt=0
        await user.save()
        res.json({msg:"successfully reset your password"})

    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ msg: "Something went wrong. Please try again." });
    }
};


export {userRegister,userLogin,userLogout,sendVerifyOtp,verifyAccount,isAuthenticated,ResetOtp,resetPass}