import mongoose from "mongoose";


const fileSchema=new mongoose.Schema({
    file_name:{type:String,required:true},
    status:{type:String,required:true},
    totalValid:{type:Number,required:true},
  
    user:{type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true},
    fileData:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"fileTable"
        
    }],
    enrichment:{type:String,default:"Level 1"},

    totalData:{type:Number,required:true},
    data: [{ type: mongoose.Schema.Types.Mixed, required: true }]
  },{timestamps:true})

  fileSchema.pre('save', function (next) {
    this.data = this.data.map(item => {
        if (!item._id) {
            item._id = new mongoose.Types.ObjectId();
        }
        return item;
    });
    next();
});

export default mongoose.model("file",fileSchema);