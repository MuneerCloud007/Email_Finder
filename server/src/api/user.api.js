import express from "express";
import { register, refresh,login,logout,getUserData,updatePassword,forgotPassword} from "../controller/user.controller.js";

const api = express.Router();

// Register route
api.post('/register', register);

// Login route
 api.post('/login', login);

// Refresh token route
api.post('/refresh', refresh);

// Logout route
 api.post('/logout', logout);
//get User Data
 api.get("/getUserData/:id",getUserData);
//Update password
 api.put("/updatePassword/:id",updatePassword);
api.put("/forgotPassword",forgotPassword);
export default api;


