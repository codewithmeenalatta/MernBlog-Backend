import { Comment } from "../model/commentSchema";
import { Post } from "../model/postSchema";
const addComment = async (req ,res) => {
    try {
        const {text} = req.body;
        const {postId} = req.params;

        if(!text){
            return res.status(400).json({message : "comment is required"})
        }
        const post = await Post.findById(postId)
        if(post) return res.status(400).json({message : "post not found"})

            const comment = await Comment.create({
                text,
                author : req.user.id,
                post : postId
            })

            //! push the comment id to the post schema comment array

            post.comments.push(comment._id)
            await post.save()

            //?populate the comment from saved comment
            const populatedcomment = await comment.populate("author" , "name username profile")

            res.status(201).json({message : "comment added" , comment : populatedcomment })
    } catch (error) {
        res.status(500).json({message : "server error"})
    }
}

//* get all comments
const getAllComments =  async (req , res) => {
    try {
        const {postId } = req.params;
        const comments = await comment.find({post : postId}).populate("author" , "name username profile").sort({createdAt : -1})
        res.status(200).json({message  : "comment fetched" , comments , counts : comments.length})
    } catch (error) {
        res.status(500).json({message  : "server error" , error : error.message})
    }
    
}

export { addComment , getAllComments};