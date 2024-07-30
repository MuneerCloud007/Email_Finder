import multer from 'multer';
import express from  "express";


import {FileTesting,getAllFileData,fileDownloadController,getFileById,addRowFile,deleteRowFile,updateByIdCell,fileById} from "../controller/fileUpload.controller.js";

const api = express.Router();
const upload = multer();

api.post('/uploadTesting',FileTesting)
api.get("/getAllFile/:id",getAllFileData);
api.post("/download/File",fileDownloadController);

api.post("/file/getById",getFileById);
api.post("/addRow",addRowFile)

api.delete("/delete/rowData",deleteRowFile)
api.put("/update/cell/:id",updateByIdCell)
api.get("/")


export default api;