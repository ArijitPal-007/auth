import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";


const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ msg: "All fields are required" });
        }

        const existEmail = await userModel.findOne({ email });
        if (existEmail) {
            return res.json({ msg: "Email already exists!!!" });
        }

        const hashPass = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashPass });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to the website",
            text: `Welcome to CodeRefresh! Your account has been created with email ID: ${email}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, msg: "User created successfully", user, token });

    } catch (error) {
        res.json({ success: false, msg: "Error in registration" });
        console.log("Error in register:", error);
    }
};

const userLogin  = async (req,res)=>{
    try {
        const {email,password} = req.body
        if(!email || !password){
            res.json({msg:"all field required"})
        }
        const user = await userModel.findOne({email})
        if(!user){
            return req.json({msg:"invalid email"})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.json({msg:"password not match"})
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"})
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ?
            "none" : "strict",
            maxAge: 7 * 24 *60 * 60 * 1000
        })

        return res.json({success:"true"})

    } catch (error) {
        res.json({success:"false"})
        console.log("error in userlogin",error);
    }
}

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

const sendVerifyOtp = async (req,res)=>{
   try {
     const {userId} = req.body
     const user = await userModel.findById(userId)
     if(user.isAccountVerified){
         return res.json({msg:"account already verified...."})
     }
     const genOtp = String(Math.floor(100000+Math.random()*900000))
     user.verifyotp = genOtp
     user.verifyExpireAt = Date.now() + 5 * 60  * 1000
     
     await user.save()
 
     const mailOptions = {
         from: process.env.SENDER_EMAIL,
         to: user.email,
         subject: "Account verify OTP",
         text: `your otp is ${genOtp} This otp valid  your account for 5 min..`,
     };
     await transporter.sendMail(mailOptions)
     res.json({msg:"send otp on your email.."})
   } catch (error) {
    res.json({msg:"account verify unsuccessfully.."})
    console.log("error in verify otp",error);
   }
}

const verifyAccount = async (req,res)=>{
   try {
     const {userId,genOtp} = req.body
     const user = await userModel.findById(userId)
 
     if(!user){
         return res.json({msg:"invaild user!!!"})
     }
     if(user.verifyotp === "" || user.verifyotp !== genOtp){
        return res.json({msg:"invalid otp hai bhai"})
     }
     if(user.verifyExpireAt < Date.now()){
        return res.json({msg:"otp expair"})
     }
     user.isAccountVerified = true
     user.verifyotp = ""
     user.verifyExpireAt = 0

     await user.save()

     res.json({msg:"email verify successfully"})
   } catch (error) {
    res.json({msg:"verify got an error"})
    console.log("verify acount error",error);
   }
}

const isAuthenticated = async (req,res)=>{
    try {
        res.json({msg:"autheticated"})
    } catch (error) {
        res.json({msg:error.message})
        console.log("isAuthenticated error",error);
    }
}

const ResetOtp = async (req,res)=>{
    try {
        const {email} = req.body
        if(!email){
            return res.json({msg:"invalid email"})
        }
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({msg:"user not found"})
        }
        const genOtp = String(Math.floor(100000+Math.random()*900000))
        user.resetotp = genOtp
        user.resetOtpExpireAt = Date.now() + 5 * 60  * 1000
     
     await user.save()
 
     const mailOptions = {
         from: process.env.SENDER_EMAIL,
         to: user.email,
         subject: "Reset OTP For Verification",
         text: `your otp for resetting password is ${genOtp}.use this otp to peocess with resetting your password`,
     };
     await transporter.sendMail(mailOptions)
     res.json({msg:"send Restotp on your email.."})
    } catch (error) {
        
    }

}

const resetPass = async (req, res) => {
    const { email, genOtp, newPass } = req.body;
    
    if (!email || !genOtp || !newPass) {
        return res.json({ msg: "Email, OTP, and new password are required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ msg: "User not found" });
        }

        if (!user.resetotp || user.resetotp !== genOtp) {
            return res.json({ msg: "Invalid OTP or expired" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ msg: "OTP expired" });
        }

        const hashPass = await bcrypt.hash(newPass, 10);

        user.password = hashPass;
        user.resetotp = "";
        user.resetOtpExpireAt = 0;

        await user.save();
        res.json({ msg: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ msg: "Something went wrong. Please try again." });
    }
};


export {userRegister,userLogin,userLogout,sendVerifyOtp,verifyAccount,isAuthenticated,ResetOtp,resetPass}