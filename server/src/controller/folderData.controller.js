import ApiError from "../utils/ApiError.js";
import FolderSchema from "../model/folder.model.js"
import emailVerificationModel from "../model/emailverfier.model.js";
import companyInfo from "../model/companyInfo.js";
const createFolder = async (req, res, next) => {
    try {
        const { foldername, user } = req.body;

        if (!foldername) {
            throw new Error(ApiError.notFound("Folder name is not found"))

        }
        const newFolder = FolderSchema({
            FolderName: foldername,
            user: user
        })
        await newFolder.save()

        res.status(201).json({
            success: true,
            data: newFolder
        })



    } catch (err) {
        next(err);

    }
}

const getAllFolder = async (req, res, next) => {

    const userId = req.params.id;
    if (!userId) {
        throw new Error(ApiError.badRequest("Pls provide a userId"))
    }

    const data = await FolderSchema.find({ user: userId });
    if (data.length == 0) {
        throw new Error(ApiError.notFound("UserId does't exist"));
    }
    res.status(200).json({
        success: true,
        data: data
    })

}

const updateFolderById = async (req, res, next) => {
    try {
        const { currentFolder, newFolder } = req.body;
        const ip = req.ip || req.connection.remoteAddress; // Get the IP address from the req object
        const userAgent = req.headers['user-agent']; // Get the User Agent from the req object
        const uniqueRoom = `${ip}`; // Create the same unique room identifier
        
        if (!currentFolder || !newFolder) {
            return next(ApiError.badRequest("Please provide the folders"));
        }

        await FolderSchema.findByIdAndUpdate(currentFolder, { checked: false });
        const docs = await FolderSchema.findByIdAndUpdate(newFolder, { checked: true }, { new: true });

        if (!docs) {
            return next(ApiError.badRequest("Please provide a valid ID"));
        }

      


        return res.status(200).json({
            success: true,
            data: docs
        });
    } catch (err) {
        return next(err);
    }
};


const deleteFolder = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw  ApiError.badRequest("Pls provide a valid id");
        }
        const data = await FolderSchema.findByIdAndDelete(id);
        if (!data) {
            throw new Error(ApiError.badRequest("Pls provide a valid id"));
        }

        const folderEmail = await emailVerificationModel.findOne({ folder: data._id });
        console.log("FOlder email here !!!!");
        console.log(folderEmail);
  
        if (folderEmail) {
            if(folderEmail.companyInfo.length>0){
          await Promise.all(folderEmail.companyInfo.map(async (vl) => {
            await companyInfo.findById(vl); 
          }));
        }
    
          await emailVerificationModel.deleteOne({ folder: folderEmail.folder });
        }
        
        res.status(200).json({
            success: true,
            data: data
        })
    }
    catch (err) {
        next(err);
    }



}


const renameFolder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        console.log(name);
        if (!id) {
            throw new Error(ApiError.badRequest("Pls provide a valid id"));
        }
        if (!name) {
            throw new Error(ApiError.badRequest("Pls provide a valid name"));
        }
        const data = await FolderSchema.findByIdAndUpdate(id, { FolderName: name }, { new: true });
        console.log(data);
        res.status(200).json({
            success: true,
            data: data
        })
    }
    catch (err) {
        next(err);
    }

}


export { createFolder, getAllFolder, updateFolderById, deleteFolder, renameFolder }
