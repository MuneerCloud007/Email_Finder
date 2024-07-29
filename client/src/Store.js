import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./features/slice/userSlice";
import EmailVerifierReducer from "./features/slice/emailVerifier";
import emailVerifier from "./features/slice/emailVerifier";
import fileSlice from "./features/slice/fileSlice";


const Store=configureStore({
    reducer:{
       auth :AuthReducer,
       emailVerifier:EmailVerifierReducer,
       file:fileSlice
        
    }
})

export default Store;