import userModel from "../models/userModel.js";


const userDetails = async(req,res)=>{
    try {
        const {userId} = req.body
        const user = await userModel.findById(userId)
        if(!user){
            return res.json({msg:"user not found"})
        }
        res.json({
            success:true,
            name:user.name,
            isAuthenticated:user.isAccountVerified
        })
    } catch (error) {
        console.log("error in userDetails",error);
        res.json({msg:error})        
    }
}
export {userDetails}