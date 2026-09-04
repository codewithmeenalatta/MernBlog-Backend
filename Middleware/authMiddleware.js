import jwt from "jsonwebtoken";
import { User } from "../model/userSchema.js";
const requireAuth = async (req , res , next) => {

    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({ success: false , message : "Unauthorized - No token provide"});
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);


        const user = await User.findById(decode.id).select("-password");
        if(!user){
            return res.status(401).json({ success : false , message : "User not found or token expried"});
        }
            req.user = user;
            next();

    } catch (error) {
        return res.status(401).json({ success : false, message : "Invalid or expire token"})
    };
    //is user login h ya logout
    // const token = req.cookies.token;
    // //console.log(token , token is expire)
    // if(!token){
    //     return res.status(401).json({message : "Unauthorized"})
    // }

    // try {
    //     const decode = jwt.verify(token , process.env.JWT_SECRET)
    //     req.user = decode
    //     next()
    // } catch (error) {
    //     res.status(401).json({message : "invalied token"})
    // }
}
export {requireAuth};