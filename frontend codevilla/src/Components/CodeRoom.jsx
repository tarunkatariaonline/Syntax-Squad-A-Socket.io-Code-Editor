import React, { useState } from 'react'

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
  return (
    <div>
        <div>
            {users.map((user)=>{
             return <li key={user.id} >{user.username}</li>
            })}
        </div>

        <div>
            <textarea name="" id="" cols="30" rows="10"></textarea>
        </div>

        <div>
        <button style={{backgroundColor:"green",color:"white"}}>Copy Room id</button>
            <button style={{backgroundColor:"blue",color:"white"}}>leave</button>
        </div>
    </div>
  )
}

export default CodeRoom