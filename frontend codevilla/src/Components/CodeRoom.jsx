import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { useParams,useSearchParams } from 'react-router-dom';

import Avatar from 'react-avatar';
import {  toast } from 'react-toastify';

function CodeRoom() {

    const [users,setUsers] = useState([
       
      ])

      const [searchParams, setSearchParams] = useSearchParams();
    const username =  searchParams.get("username");
  

      const [codeText,setCodeText]= useState('')
      const {id}  = useParams();

      const handlerCodewriter = (e) => {
        const newValue = e.target.value;
    setCodeText(() => newValue);
   
    const socket = io('http://localhost:3000/');
  
      socket.emit('codebase',{id,newValue})
   
   
        
        // setCodeText(msg);
      };
    
    

   

      useEffect(()=>{

        console.log(codeText)
        const socket = io('http://localhost:3000/');
        socket.emit("room-join",{username:username,roomId:id})
        //  navigate('/code/'+roomId)
        socket.on("joined",(msg)=>{
          toast(msg.username +" Joined " + msg.roomId)
          
        })
        socket.emit("users-info",id);
        socket.on("users",(roomUsers)=>{
         console.log(roomUsers)
         setUsers(roomUsers)
        })

        
        socket.on("cods",(msg)=>{
          console.log(msg)
          setCodeText(msg)
         })
        socket.on("error", (error) => {
          console.error("Socket error:", error);
        });

       


         return ()=>{
          socket.disconnect();
         }

      },[])
  return (
    <div className='  -z-10 w-full h-[100vh] text-slate-400 bg-slate-900  flex justify-center items-center   flex-col  p-10 '>
      <img className=' absolute  -z-0 top-0 right-0 backdrop-blur-lg' src='https://tailwindcss.com/_next/static/media/docs-dark@30.1a9f8cbf.avif'/>

      <div className=' w-full h-full z-30 flex'>

        <div className='    w-72 h-full bg-gray-500/50 rounded-lg p-2 justify-center items-start'>
         
        <div className=' '>
        <div className=' m-1  text-md text-gray-300 font-bold '>
          Connected Users :
        </div>

        {users.map((user,index)=>{
         return  <Avatar key={index} name={user.username} size='45' className='  rounded-lg  m-1 '  textSizeRatio={2.5}  />
        })}
       
       
        </div>
        
        </div>

        <div className='  ml-3 w-full h-full  rounded-lg'>
         <textarea value={codeText} placeholder=' Code here' onChange={handlerCodewriter} className=' w-full h-full bg-gray-500/50 rounded-lg  text-white ' name="" id="" cols="30" rows="10"></textarea>
        </div>

      </div>
       
    </div>
  )
}

export default CodeRoom