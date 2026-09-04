import jwt from 'jsonwebtoken';
import {User} from '../model/userSchema.js'

//!this is autho protect route for his own post which he can delete and update

export const userPostProtect = async (req , res , next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({message : "Unauthorized"})
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findOne(decode.id).select("-password");
        next();
    } catch (error) {
        res.status(500).json({message : "server side error"})
    }
}