import express from "express";
import { requireAuth } from "../Middleware/authMiddleware.js";
import {createPost , getAllPosts, searchPost , getMyPosts } from "../controller/postController.js"
import { getPostById ,deletePost,updatePost} from "../controller/getPostController.js";
import { upload } from "../Middleware/multer.js";
const router = express.Router()


//? search post by name 
router.get('/search' , searchPost);
router.get('/my-posts' , requireAuth , getMyPosts);
router.post('/create' , requireAuth , upload.single('image') , createPost);
router.get('/all-post' , getAllPosts)

//!delete post by id

router.delete('/:id', requireAuth, deletePost)

//! update post by id
router.put('/edit/:id',requireAuth,upload.single('image'), updatePost)


//? get post by id 
router.get('/:id', requireAuth, getPostById)

export default router;