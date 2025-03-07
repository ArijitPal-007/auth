import express from "express"
import jwt from "jsonwebtoken"

const userAuth = async (req,resizeBy,next)=>{
    const {token} = req.cookies
    if(!token){
        return res.json({msg:"not autheticated,Login again"})
    }
    try {
        const tokenDecoded = jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecoded.id){
            req.body.userId = tokenDecoded.id
        }else{
            return res.json({msg:"not autheticated,Login again"})
        }
        next()
    } catch (error) {
        res.json({msg:error.message})
        console.log("middleware error",error);
    }
}
export default userAuth