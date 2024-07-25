import express from  "express";
const api = express.Router();
import { 
    getCredit
} from "../controller/credit.controller.js";
import checkAuthorization from "../utils/isAuthorized.js";

api.get("/get/:id",getCredit);

export default api;