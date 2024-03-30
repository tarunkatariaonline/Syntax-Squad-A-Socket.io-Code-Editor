import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
function Home() {

    const [username,setUsername] = useState('');
    const [roomId,setRoomId] = useState('');
    const navigate = useNavigate(); 


    const handlerSubmit =  ()=>{
       navigate('/code/'+roomId)
    }
  return (
   <div>

    <input type="text" value={username} onChange={(e)=>{
        setUsername(e.target.value)
    }}  placeholder='enter your username' />
    <input value={roomId} onChange={(e)=>{
      setRoomId(e.target.value)
    }} type="text" placeholder='enter your roomid' />
    <button style={{backgroundColor:"blue",color:"white"}} onClick={handlerSubmit} >Submit</button>

   </div>
  )
}

export default Home