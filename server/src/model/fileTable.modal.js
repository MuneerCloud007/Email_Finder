import mongoose from "mongoose";

const fileTable=new mongoose.Schema({
    fileId:{type:mongoose.Schema.Types.ObjectId,ref:"file"},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    domain:{type:String,required:true},
    certainty:{type:String,required:true},
    mxRecord:{type:String,required:true},
    mxProvider:{type:String,required:true}

})

export default mongoose.model("fileTable",fileTable);