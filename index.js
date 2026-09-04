import express from "express"
import dotenv from "dotenv";
dotenv.config()
import connectDB from "./DB/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRegisterRoute from "./router/userRouter.js";
import userPostCreate from "./router/postRouter.js";
import path from "path";
const PORT = process.env.PORT || 3000
const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended : true}))
app.use(cors({
    origin : [
        "http://localhost:5173",
    ],
    methods : ['GET' , 'POST' , 'PUT' , 'DELETE' , 'OPTIONS'],
    allowedHeaders : ['Content-Type' , 'Authorization' , 'Accept'],
    credentials : true
}))

app.use('/uploads' , express.static('uploads'))

app.get('/' , (req , res) => {
    res.json({message : "server is running"})
})

app.use('/api/user' ,  userRegisterRoute);
app.use('/api/post' , userPostCreate);
// app.use('/api/user' , userRoutes)
// app.use('/api/comment' , userComment)


connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`server running on http://localhost:${PORT}`)
    })
}).catch(err => {
    console.error('Failed to connect to database:' , err)
})