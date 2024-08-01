import express from "express";
import { register, refresh,login,logout,getUserData,updatePassword,forgotpassword,emailVerify,forgotpasswordUpdate} from "../controller/user.controller.js";

const api = express.Router();

// Register route
api.post('/register', register);

api.get('/emailVerify/:id',emailVerify)

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
api.post("/request/forgotpassword",forgotpassword);
//Verify forgot password
api.put("/verify/forgotpassword/:id",forgotpasswordUpdate);

export default api;


