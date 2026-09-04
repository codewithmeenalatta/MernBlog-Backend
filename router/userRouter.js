import express from "express";
import { forgotPassword, getUserProfile, resetPassword, updateProfile, userLogin, userLogout, userRegister , updatePassword} from "../controller/userController.js"
import {requireAuth} from "../Middleware/authMiddleware.js";
const  router = express.Router()
router.get('/profile' , requireAuth , getUserProfile)
router.post('/register' , userRegister)
router.post("/login" , userLogin)
router.post("/logout" , userLogout)
router.post("/forgot-password" , forgotPassword)
router.post("/reset-password/:token" ,  resetPassword)
//profile router
// router.post("/profile" , reqiureAuth , getUserProfile);
router.put("/update-profile" , requireAuth , updateProfile);
router.put("/update-password" , requireAuth , updatePassword)
export default router;