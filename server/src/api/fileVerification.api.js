import { fileVerification
 } from "../controller/fileVerification.controller.js";
 import multer from 'multer';
 import express from  "express";

 const api = express.Router();
const upload = multer();


api.post('/upload',fileVerification)


export default api;


