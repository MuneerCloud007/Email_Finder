import mongoose from "mongoose";

const fileTable=new mongoose.Schema({
    fileId:{type:mongoose.Schema.Types.ObjectId,ref:"file"},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    firstName:{type:String,default:"invalid"},
    lastName:{type:String,default:"invalid"},
    domain:{type:String,default:"invalid"},
    email:{type:String,default:"invalid"},
    certainty:{type:String,default:"invalid"},
    mxRecord:{type:String,default:"invalid"},
    mxProvider:{type:String,default:"invalid"},
   quality:{type:String,},
   status:{type:String}


})

export default mongoose.model("fileTable",fileTable);