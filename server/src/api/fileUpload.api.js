import multer from 'multer';
import express from  "express";

import {FileUpload} from "../controller/fileUpload.controller.js";

const api = express.Router();
const upload = multer();

api.post('/upload/:id/:socket', upload.single('file'),FileUpload) 


export default api;