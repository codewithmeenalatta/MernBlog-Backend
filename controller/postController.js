import { Post } from "../model/postSchema.js";
import cloudinary from "../config/cloudinary.js";
export  const createPost = async (req , res) => {
    try {
        const {title , content} = req.body;
        const author = req.user._id || req.user.id;

        if(!title || !content) {
            return res.status(400).json({message : "title & content are both required"});
        }

const alreadyExists = await Post.findOne({ title: title, content: content });
        if(alreadyExists){
            return res.status(400).json({message  : "post already exist"})
        }

         let imageUrl = "";
         if(req.file){
            const result = await new Promise((resolve , reject) => {
                cloudinary.uploader.upload_stream(
                    {folder : "blog_posts"},
                    (error ,  result) => {
                        if(error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });
            imageUrl = result.secure_url;
         }

         const newPost = await Post.create({title , content ,  image : imageUrl , author});
         await newPost.populate("author" , "name username profile");
         res.status(201).json({message : "post created" , post : newPost})
    } catch (error) {
        console.error('create post sucssfully' , error)
        res.status(500).json({message : "server error" ,  error : error.message})
    }
}


export const getAllPosts = async (req , res) => {
    try {
        const posts = await Post.find()
        .populate("author" ,  "name  username profile")
        .sort({ createdAt : -1});
        res.status(200).json({message : "All post Fetched" , posts})
    } catch (error) {
        res.status(500).json({message : "server error" , error : error.message})
    }
};

export const searchPost = async (req , res) => {
    try {
        const { query} = req.query;
        if(!query) return res.status(400).json({message : "query required"});
        const posts =  await Post.find({
            $or: [
                {title : {$regex : query , $options : "i"}},
                {content : {$regex : query , $options : "i"}},
            ]
        }).populate("author" , "name username profile");
        res.status(200).json({message : "search sucessfully", posts})
    } catch (error) {
        res.status(500).json({message : "server error" , error : error.message})
    }
}

export const getMyPosts = async (req , res) => {
    try {
        const posts = await Post.find({author : req.user.id}).sort({createdAt : -1});
        res.status(200).json({message : "My Posts Fetched" , posts})
    } catch (error) {
        res.status(500).json({message : "server error" , error : error.message})
    }
}