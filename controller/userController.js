import { User } from "../model/userSchema.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import sendEmail from "../utility/sendEmail.js";


//! registration code
const userRegister = async (req, res) => {
    const { name, username, email, phone, password } = req.body;
    
    try {
        // 1. Check required fields
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "Please fill all the required fields" });
        }

        // 2. Check if email already exists
        const existEmail = await User.findOne({ email: email }); // 'user' ki jagah 'existEmail' kiya
        if (existEmail) {
            return res.status(400).json({ message: "Email ID already exists" });
        }

        // 3. Check if username already exists
        const existUsername = await User.findOne({ username: username });
        if (existUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }
         
        // 4. Check if phone number is provided and exists
        if (phone) {
            const existPhone = await User.findOne({ phone: phone });
            if (existPhone) {
                return res.status(400).json({ message: "Phone number already exists" });
            }
        }

        // 5. Check password length (Changed '>' to '<')
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashPassword = await bcrypt.hash(password,10)

        // 6. Create new user in database
        const newUser = await User.create({ name, email, username, phone, password:hashPassword }); // 'user' ki jagah 'newUser' kiya

        // 7. JWT token generation (Fixed undefined variables and "id" to "1d")
        const token = jwt.sign(
            { 
                id: newUser._id, 
                name: newUser.name, 
                email: newUser.email,  
                username: newUser.username 
            },
            process.env.JWT_SECRET, // Make sure spelling matches your .env file
            { expiresIn: "1d" } 
        );

        // 8. Remove password from response for security
        newUser.password = undefined;

        // 9. Send response and set cookies
        res.status(201).cookie("token", token, {
            httpOnly: true,
            secure: process.env.SECURE !== "development",
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: process.env.SECURE === "development" ? "Lax" : "None"
        }).json({ message: "Registered successfully", user: newUser, token });
        
    } catch (error) {
        console.error("Registration error", error.message);
        res.status(500).json({ message: error.message });
    }
};

 const userLogin = async (req , res) => {
    const {username , password} = req.body

        if(!username || !password){
            return res.status(400).json({message : "fill all filed"})
        }


    try {
        //! check the email or username valid for login user can login with email or username

        const user = await User.findOne({
            $or : [ {email : username} , {username : username}]
        })

        if(!user) {
            return res.status(404).json({message : "user not found"})
        }

        const isMatchPassword = await bcrypt.compare(password , user.password)
        if(!isMatchPassword){
            return res.status(401).json({message : "Invalid Credentails"})
        }

       const token = jwt.sign(
            { 
                id: user._id, 
                name: user.name, 
                email: user.email,  
                username: user.username 
            },
            process.env.JWT_SECRET, // Make sure spelling matches your .env file
            { expiresIn: "1d" } 
        );
        user.password = undefined

        res.status(200).cookie("token" , token, {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            maxAge : 24 * 60 * 60 * 1000, //? id
            sameSite : process.env.NODE_ENV === "production" ? "Lax" : "None",
        }).json({ message: "Login Successfully" ,  user , token})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : "server side error" , error : error.message} )
    }
 }

 const userLogout = async (req , res) => {
    try {
        res.cookie("token" , "" ,  {
            maxAge : 0,
        })
        res.status(200).json({ message :  " user logout sucessfully"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : " server error" ,  error : error.message})
    }
 }

 //! profile update
 const updateProfile = async (req , res) => {
    try {
        const userId = req.user.id;
        const { bio , name , phone , username} = req.body;
        const profile = req.file?.path;
        console.log('profile update request' , {userId , bio, name , phone , hasImage: !!profile});

        //validation
        if(!bio && !name && !phone && !username &&!profile){// 'phone' added to validation
            return res.status(400).json({
                message : "At least one field  (bio , name , phone,username or profile picture) is required to update"
            })

        }

        //find current user
        const currentUser = await User.findById(userId)

        if(!currentUser){
            return res.status(404).json({message : "User not found"})
            };

            //prepare update data

            const updateData = {};
            if(bio !== undefined) updateData.bio = bio;
            if(name !== undefined) updateData.name = name;
            if(phone !== undefined) updateData.phone = phone;
            if(profile ) updateData.profile = profile; // 'phone' added to updateData
            if(username !== undefined) updateData.username = username;
            console.log('updating user with data:' , updateData);

            //update user profile
            const updateUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new : true , runValidators : true}
            ).select("-password");

            if(!updateUser){
                return res.status(404).json({message : "failed update user"});
            }
            console.log('profile update sucessfully for:' , updateUser.username);

            res.status(200).json({
                message : "profile update sucessfully",
                user : updateUser
            })
        
    } catch (error) {
        console.error('profile update error' , error)

        // Handle specific errors
        if(error.message.includes('Only image files')){
            return res.status(400).json({
                message : "invalid file type. please upload jpg , jpeg or png images."
            })
        }

        if(error.name === "Validation error"){
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message : "Validation error",
                error
            }) 
        }

        //Handle unique phone number error
        if(error.code === 11000){
            const duplicateField = Object.keys(error.keyValue)[0];
            return res.status(400).json({message : `${duplicateField} already exits`})
        }

        res.status(500).json({
            message : "Server.error",
            error : error.message
        })
    }
 }

 const updatePassword = async (req , res) => {
    try {
        const userId = req.user.id;
        const {currentPassword , newPassword} = req.body;
        if(!currentPassword || !newPassword){
            return res.status(400).json({message : "Please provide both current and new passwords"});
        };

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message : "User Not Found"});
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if(!isMatch){
            return res.status(400).json({message : "Current password is incorrect"});
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword , salt);
        await user.save();
        res.status(200).json({message : "Password updated successfully"});
    } catch (error) {
        console.error("update password error" , error);
        res.status(500).json({ message : "Server error" , error: error.message});
    }
 }


 //! Get user profile (Bonus function)
 const getUserProfile = async (req , res) =>{
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")

        if(!user){
            return res.status(404).json({message : "User not found"})
        }

        res.status(200).json({
            message : "Profile Fetch successfully",
            user
        })
    } catch (error) {
        console.error("get profile error" , error)
        res.status(500).json({  message :'Server Error' ,
            error : error.message
        });

    }
 }

 //! reset forgot password
 const forgotPassword =  async (req , res) => {
    try {
        const { email} = req.body;
        if(!email)return res.status(400).json({ message : "email is required" });
        const user = await  User.findOne({email});
        if(!user)return res.status(404).json({message : "user not found"})

            //genrate & save token

            const resetToken = user.getResetPasswordToken();
            await user.save({ validateBeforeSave : false});

            const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

            //simple html email

            const html = `
            <div style = "font-family:Arial, sans-serif">
            <h2> Password reset request</h2>
            <p>we received a request to reset your password</p>
            <p>this link will expire in <b>10 minutes</b></p>
            <p>
            <a href= " ${resetURL}" style= " background: #2563eb;color:#fff;padding:10px 16px; border-radius:8px;text-decoration:none"
            > Reset Password</a></p>
            <p>Or copy this URL</p>
            <p>${resetURL}</p>
            <br/>
            <small>if you did not request this , you can safely ignore this email
            .</small>
            </div>`;

            await sendEmail ({
                to : user.email,
                subject : "Reset your Password",
                html

            });
            return res.status(200).json({message :" Reset link sent to email"})

    } catch (error) {
        console.error("forgot password error")

        try {
            const u = await User.findOne({email : req.body.email})
            if(u){
                u.resetPasswordToken = undefined;
                u.resetPasswordExpire = undefined;
                await u.save({validateBeforeSave : false})
            }
        } catch (error) {
            return res.status(500).json({message : "Sever Error" , error : error.message})
        }
    }
 };

 //------------reset password-------//
 const resetPassword = async  (req , res) => {
    try {
        const {token } = req.params;
        const {password} = req.body;
        if(!password || password.length < 6){
            return res.status(400).json({message : " password must be at  least 6 charater"})
        }

        //hash token $ find user
        const hashed = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken : hashed,
            resetPasswordExpire : { $gt : Date.now()}
        });

        if(!user){
            return res.status(400).json({message : "invalid  or expire reset link "})
        }
        //set new password 
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(200).json({message : "password reset sucessfully. please login"});
    } catch (error) {
        console.error("reset password error" , error)
        return res.status(500).json({message : "Server error" , error : error.message})
    }
 };
 


 export {userRegister , userLogin , userLogout , updateProfile , getUserProfile , updatePassword ,resetPassword , forgotPassword} 