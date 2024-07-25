import mongoose, { mongo } from "mongoose";

const companyInfoSchema=new mongoose.Schema({
    "firstName":{
        type:String,
        default:""
    },
    "lastName":{
        type:String,
        default:""

    },
    "img":{
        type:String,
        default:""

    },
    "company":{
        type:String,
        default:""

    },
    "position":{
        type:String,
        default:""

    },
    "website":{
        type:String,
        default:""

    },
    "employees":{
        type:String,
        default:""

    },
    "industry":{
        type:String,
        default:""

    },
    "revenue":{
        type:String,
        default:""

    },
    "country":{
        type:String,
        default:""

    },
    "description":{
        type:String,
        default:""

    },
    "header_quater":{
        type:String,
        default:""

    },
    "type":{
        type:String,
        default:""

    },
    "user":{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    "email":{
        type:String,
        default:"not found"
    },
    "certainty":{
        type:String,
        default:"not found"
    },
    "profile":{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Profile"
    },

    

    "dynamicFields": [
        {
            name: String,
            value: mongoose.Schema.Types.Mixed
        }
    ]


},{timestamps:true});

const companyInfo=mongoose.model("CompanyInfo",companyInfoSchema)

export default companyInfo



