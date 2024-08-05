import mongoose from "mongoose";

const {Schema}=mongoose;

const fileOperationSchema=new Schema({
    fullName:{
        type:String,
        default:""
    },
    firstName:{
        type:String,
        default:""
    },
    lastName:{
        type:String,
        default:""
    },
    companyName:{
        type:String,
        default:""
    },
    website:{
        type:String,
        default:""
    },
    country:{
        type:String,
        default:""
    }

})

export default mongoose.model("FileOperation",fileOperationSchema);