import mongoose from "mongoose";


const fileSchema=new mongoose.Schema({
    file_name:{type:String,required:true},
    status:{type:String,required:true},
    EmailFind:{
        totalValid:{type:Number,},
        totalInvalid:{type:Number},

    },
    EmailVerify:{ 
        totalValid:{
            type:String,
            default:"N/A"

        },
        totalInvalid:{
            type:String,
            default:"N/A"

        },
        valid_catchAll:{
            type:String,
            default:"N/A"

        },
        catch_all:{
            type:String,
            default:"N/A"

        },
        disposable:{
            type:String,
            default:"N/A"

        }
    },
    totalValid:{
        type:String,
        default:"N/A"

    },
  
    user:{type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true},
    fileData:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"fileTable"
        
    }],
    enrichment:{type:String,default:"Level 1"},
    operational:{type:String,required:true},
    fileOperational:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"FileOperation",
        default:null
    },

    totalData:{type:Number,required:true},
  },{timestamps:true})



export default mongoose.model("file",fileSchema);