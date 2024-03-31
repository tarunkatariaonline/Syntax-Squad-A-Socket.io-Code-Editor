import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import { useParams,useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import {  toast } from 'react-toastify';

function CodeRoom() {

    const [users,setUsers] = useState([
        {
          id: 1,
          username: "bmcginlay0",
          roomid: 1
        },
        {
          id: 2,
          username: "ugabb1",
          roomid: 2
        },
        {
          id: 3,
          username: "sdowtry2",
          roomid: 3
        },
        {
          id: 4,
          username: "dkeohane3",
          roomid: 4
        },
        {
          id: 5,
          username: "scolter4",
          roomid: 5
        },
        {
          id: 6,
          username: "elescop5",
          roomid: 6
        },
        {
          id: 7,
          username: "wdantoni6",
          roomid: 7
        },
        {
          id: 8,
          username: "sbrockie7",
          roomid: 8
        },
        {
          id: 9,
          username: "acescotti8",
          roomid: 9
        },
        {
          id: 10,
          username: "adiclaudio9",
          roomid: 10
        }
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
            {users.map((user)=>{
             return <li key={user.id} >{user.username}</li>
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