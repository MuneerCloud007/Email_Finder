import express from "express";
import {singleEmailFinder,singleEmailFinderAndVerification,getAllEmailSearch} from "../controller/single.controller.js";


const api = express.Router();
api.post("/finder",singleEmailFinder);
api.post("/verification",singleEmailFinderAndVerification);
api.post("/getAll",getAllEmailSearch);


export default api;