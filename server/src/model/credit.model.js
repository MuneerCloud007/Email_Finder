import mongoose from "mongoose";
const creditSchema=new mongoose.Schema({
    points:{type:Number,default:200},
    plan:{type:String,default:"Free"},
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})

export default mongoose.model("Credit",creditSchema);