import mongoose from "mongoose";
const {Schema}=mongoose;
const FileVerificationSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    quality:{
        type:String,required:true
    },
    result:{
        type:String,required:true
    }
})

export default mongoose.model("FileVerification",FileVerificationSchema);