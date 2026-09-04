import express from "express";
import { addComment , getAllComments } from "../controller/commentController";
import { reqiureAuth } from "../Middleware/authMiddleware";
const router = express.Router()
router.post('/add/:postId', reqiureAuth , addComment); 
router.get('/all/:postId' , getAllComments);

export  default router