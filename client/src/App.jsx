import React, { useMemo, useEffect } from 'react'
import Header from './pages/Header'
import Footer from './pages/Footer'
import { Outlet } from "react-router-dom"
import "./App.css"
import "./index.css"
import io, { Socket } from 'socket.io-client';
import { useDispatch } from "react-redux"
import { addEmailVerifier,updateCredits } from "./features/slice/emailVerifier";
import socketContextApi from "./contextApi/SocketContextApi";
import {getAllFileSlice} from "./features/slice/fileSlice";


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


function App() {

  const storedSocketId = localStorage.getItem('socketId');

  const socket = useMemo(() => io('http://localhost:5000', {
    query: { socketId: storedSocketId },
  }), [storedSocketId]);

  const dispatch = useDispatch();
  const user=JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    console.log("USEFFECT FOR SOCKET");
    console.log(socket);

    socket.on("connect", () => {
      console.log("Socket is connected");
      console.log("Socket ID:", socket.id);
      if (!storedSocketId) {
        localStorage.setItem('socketId', socket.id);
      }


      socket.on("postEmailVerifier", async ({ success, data }) => {
        console.log("I am in postEmailVerifier socket!!!!");
        if (success) {
          console.log("I am inside");
          await delay(2000)
          location.reload();
          // dispatch(addEmailVerifier(data));


        }
      })
      socket.on('updateCredit', (data) => {
        alert("SOCKET IS CALLED!!! POINTS");

        if (data.success) {
          //Data is success....
          console.log(data);
          dispatch(updateCredits(data.data));
        } else {
            console.error('Failed to update credit:', data);
        }
    });
    socket.on("File_Pending",({message,success})=>{
      if(success){


        dispatch(getAllFileSlice({method:"get",url:`/api/v1/file/getAllFile/${user["userId"]}`}));


      }
    })

    socket.on("File_success",({message,success})=>{
      console.log(message);
      if(success){

        if(message["user"]==user['userId']){
        dispatch(getAllFileSlice({method:"get",url:`/api/v1/file/getAllFile/${user["userId"]}`}));
      }
    }




    })

      socket.on("LoginUser",(data)=>{
        console.log("I am Login User");
        console.log(data);
      })
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      console.log("Disconnecting socket...");
      socket.disconnect();
    };
  }, []);



  return (
    <socketContextApi.Provider value={{socket:socket}}>

      <div className="app h-[98vh] m-2 flex flex-col justify-between  ">
        <Header />
        <Outlet />
        <Footer/>

      </div>
      </socketContextApi.Provider>


  )
}

export default App