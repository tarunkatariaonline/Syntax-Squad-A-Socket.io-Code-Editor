import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { useParams,useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
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
    <div>
        <div>
            {users.map((user,index)=>{
             return <li key={index} >{user.username}</li>
            })}
        </div>
        <div>
          {codeText}
        </div>
        <div>
            <textarea value={codeText} onChange={handlerCodewriter} name="" id="" cols="30" rows="10"></textarea>
        </div>

        <div>
        <button style={{backgroundColor:"green",color:"white"}}>Copy Room id</button>
            <button style={{backgroundColor:"blue",color:"white"}}>leave</button>
        </div>
    </div>
  )
}

export default CodeRoom