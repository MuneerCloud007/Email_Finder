import mongoose, { mongo } from "mongoose";
import emailVerificationModel from "./emailverfier.model.js";
import companyInfo from "./companyInfo.js";

const FolderSchema=new mongoose.Schema({
FolderName:{type:String,required:true},
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
checked:{type:Boolean,default:false}
})

export default mongoose.model("FolderData",FolderSchema)



