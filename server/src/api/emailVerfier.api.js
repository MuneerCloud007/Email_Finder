// Import required modules and controllers
import express from  "express";
const api = express.Router();
import { scrapeController,findEmailVerifierController,findEmailVerifierById,updateByIdCell,addColumn,companyInfo,postEmailTableData,
    addRow,removeRow
} from "../controller/emailverfier.controller.js";
import {autoWebscraping,ProfileScraping} from "../controller/autoWebscraping.controller.js";


import checkAuthorization from "../utils/isAuthorized.js";

// Define your routes
api.post("/post", scrapeController); // Assuming you want to define a POST route here
api.post("/getAll",findEmailVerifierController);
api.route("/getById/:id").post(findEmailVerifierById);
api.route("/put/cell/:id").put(updateByIdCell);
api.route("/post/rowData").post(addRow);
api.get("/getAll/companyInfo",companyInfo)
api.post("/post/table",postEmailTableData);
api.delete("/delete/rowData",removeRow);
api.route("/add/column").post(addColumn);
api.post("/autoWebscraping",autoWebscraping)
api.post("/profile",ProfileScraping);


// Export the router
export default  api;

