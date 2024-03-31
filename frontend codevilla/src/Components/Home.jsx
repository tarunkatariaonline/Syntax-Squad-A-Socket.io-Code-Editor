import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import {  toast } from 'react-toastify';
function Home() {

    const [username,setUsername] = useState('');
    const [roomId,setRoomId] = useState('');
    const navigate = useNavigate(); 


    // useEffect(()=>{

    //   const socket = io('http://localhost:3000/');
    //   socket.emit("msg","I am connected")
     
    //   return  ()=>{
    //     socket.disconnect();
    //   }
    // },[])


    const handlerRoomJoin =  ()=>{

  
      navigate('/code/'+roomId+'?username='+username)
    }
  return (
   <div>

    <input type="text" value={username} onChange={(e)=>{
        setUsername(e.target.value)
    }}  placeholder='enter your username' />
    <input value={roomId} onChange={(e)=>{
      setRoomId(e.target.value)
    }} type="text" placeholder='enter your roomid' />
    <button style={{backgroundColor:"blue",color:"white"}} onClick={handlerRoomJoin} >Submit</button>


   </div>
  )
}

export default Home