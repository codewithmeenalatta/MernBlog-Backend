import  { Schema  , model} from "mongoose";
const userPostSchema = new Schema({
    title : {type : String , required : true},
    content : {type : String , required : true},
    image : {type : String , default : ""},
    category : {type : String , default : ""},
    author : {type : Schema.Types.ObjectId , ref : "User" , required : true},
    Comments : [{type : Schema.Types.ObjectId , ref : "Comment"}]
} , {timestamps : true})
export const Post = model('Post' , userPostSchema)