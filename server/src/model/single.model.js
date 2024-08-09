import mongoose from "mongoose";

const {Schema}=mongoose;

const singleSchema=new Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    companyName:{
        type:String,
        default:""
    },
    email:{
        type:String,
        default:"N/A"
    },
    domain:{
        type:String,
        default:""
    },
    operational:{
        type:String,
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"

    },
    quality:{type:String,default:"N/A"},
    status:{type:String,default:"N/A"},
    completed:{
        type:String,required:true
    }

})

export default mongoose.model("SingleData",singleSchema);