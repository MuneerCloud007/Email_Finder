import {autoWebscraping,ProfileScraping} from "../controller/autoWebscraping.controller.js";
import express from  "express";
const api = express.Router();
api.get("/get",(req,res)=>res.status(200).json({message:"Muneer!!!"}))
api.post("/postData",autoWebscraping) ///api/v1/autoWebscraping/post
api.post("/profile",ProfileScraping);

export default api;


