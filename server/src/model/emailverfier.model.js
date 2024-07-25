import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({

    "companyInfo": [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyInfo",
        required: true //I have wrote additionField inside the companyInfo,
    

    }],


    "user": {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",
        required: true
    },


    "folder": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FolderData",
        required: true
    },
  

}, { timestamps: true })
const emailVerificationModel = mongoose.model("emailData", emailSchema);;

export default emailVerificationModel;



