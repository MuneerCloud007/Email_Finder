

import React, { useEffect } from 'react'
import CreditTwo from "./CreditTwo"
import { useDispatch,useSelector } from 'react-redux'
import {getCreditSlice} from "../../features/slice/emailVerifier";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function Credit() {
  //Using userId make a api call to backedn to get the credits 
  //Build a socket which takes check if data is updated
  //If data is updated then update the credit component
  const dispatch = useDispatch()
   const {Credit} = useSelector(state => state.emailVerifier);
  const user=JSON.parse(localStorage.getItem("user"));
  const user_Id=user["userId"];



useEffect(()=>{
  if(user_Id){
  dispatch(getCreditSlice({
    url:`/api/v1/credit/get/${user_Id}`,
    method:"get",
  }))
  }
},[user_Id])

if(Credit.loading){
  return   <div className="p-4">
  <Skeleton height={40} width={200} />
  <Skeleton height={20} width={100} style={{ marginTop: 10 }} />
</div>
}
if(Credit.error.status){
  throw new Error(Credit.error.message);
}
if(Credit.data["points"] || Credit.data["plan"]){

  return (
    <CreditTwo
    points={Credit.data["points"]}
    plan={Credit.data["plan"]}
    />
  )
}
}

export default Credit