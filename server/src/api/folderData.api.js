import express from "express";
import { createFolder,getAllFolder,updateFolderById,deleteFolder,renameFolder } from "../controller/folderData.controller.js";
const api = express.Router();

// Register route
api.post('/create', createFolder);
api.put("/updateById",updateFolderById)  
api.get('/getAll/:id',getAllFolder)
api.delete("/delete/:id",deleteFolder);
api.put("/rename/:id",renameFolder);


export default api;


