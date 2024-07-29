import React from 'react'
import { Navigate } from "react-router-dom";
import axios from '../utils/Proxy';
import { useSelector } from 'react-redux';


function ProtectedRoutes({children}) {
  const isLogin=JSON.parse(localStorage.getItem("user"));
  console.log(isLogin)


  
  if(isLogin) {

    axios.defaults.headers.common['Authorization'] = 'Bearer ' + isLogin.token;
    return(
    <>
    {children}
    </>
    )

  }
  else{
    return(
    <Navigate to="/" replace={true} />
    )

  }

}

export default ProtectedRoutes