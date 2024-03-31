import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import {  toast } from 'react-toastify';
function Home() {

    const [username,setUsername] = useState('');
    const [roomId,setRoomId] = useState('');
    const navigate = useNavigate(); 


 


    const handlerRoomJoin =  ()=>{

      if(!roomId ){
        toast.error("Please Enter Room ID",{
          position:"top-right",
          theme:"dark"
        });
      }else if (!username){
        toast.error("Please Enter Username",{
          position:"top-right",
          theme:"dark"
        });
      }else{
      navigate('/code/'+roomId+'?username='+username)
      }
    }
  return (
   <div className='  -z-10 w-full h-[100vh] text-slate-400 bg-slate-900  flex justify-center items-center   flex-col '>

 <img className=' absolute  -z-0 top-0 right-0 backdrop-blur-lg' src='https://tailwindcss.com/_next/static/media/docs-dark@30.1a9f8cbf.avif'/>


 <div className='  z-30   w-[500px]  bg-gray-500/50 rounded-lg  h-80 flex  justify-center items-center flex-col p-8'>
 <form onSubmit={(e)=>{
  e.preventDefault();
  handlerRoomJoin();
 }} >

  <input placeholder=' Enter Your Room Id' min={3} minLength={5}  value={roomId} onChange={(e)=>{
    setRoomId(e.target.value)
  }} className='  w-full h-12 rounded-md bg-gray-500 text-white mt-4 mb-3 p-2  placeholder-gray-300'/>
  <input placeholder=' Enter Your Username' minLength={5} value={username} onChange={(e)=>{
    setUsername(e.target.value)
  }} className='  w-full h-12 rounded-md bg-gray-500 text-white mt-4 mb-3 p-2 placeholder-gray-300'/>

  <button className=' w-full bg-gradient-to-r from-cyan-500/80 to-blue-500 hover:bg-blue-600/90 backdrop-blur-lg text-white h-12 rounded-md mt-3 mb-3 p-2  font-bold' type="submit" >Join Room</button>

  <div className=' w-full flex justify-end  pr-3 mt-2  text-gray-300 font-bold cursor-pointer   hover:text-blue-400'>
   Create Room ?
  </div>
  </form>
 </div>

   </div>
  )
}

export default Home