import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client';
import { useParams, useSearchParams } from 'react-router-dom';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-solarized_dark'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';


import axios from 'axios'

// Import any additional CodeMirror modes or addons if needed


import Avatar from 'react-avatar';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import NotWorking from './NotWorking';

function CodeRoom() {

  const [users, setUsers] = useState([

  ])


  const navigate = useNavigate();
  const [output,setOutput] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const username = searchParams.get("username");

  let controller = new AbortController();

  const [codeText, setCodeText] = useState('console.log("hello world")')
  const { id } = useParams();

  const handlerCodewriter = (newValue) => {
    // const newValue = e.target.value;
    setCodeText(newValue);


    const socket = io('http://localhost:3000/');

    socket.emit('codebase', { id, newValue })



    // setCodeText(msg);
  };



 const  handlerCopyRoomId = async()=>{
  try {
    await navigator.clipboard.writeText(id);
  toast.success("Room ID copied !",{
    position:"top-right",
    theme:"dark"
  }); // Reset copied state after 2 seconds
  } catch (error) {
    toast.error("Room ID not copied !",{
      position:"top-right",
      theme:"dark"
    });
  }
  
  
 }



  const outputWithBreaks =output.split('\n').map((line, index) => (
    <div key={index}>{line}</div>
  ));

   
 const  handlerLeaveRoom = ()=>{
    navigate('/')
  }
  const handlerCodeRun = async () => {
    const socket = io('http://localhost:3000/');

   


  

    try {
      const timer = setTimeout(() => {
        controller.abort();
        controller = new AbortController();
        throw new Error("time limit exceeded:infinite loop");
      }, 5000)
      const res = await fetch('https://backendsyntaxsquad.vercel.app/execute-js', {
        method: "POST",


        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

          code: codeText

        }),
      });
      const json = await res.json();
      clearTimeout(timer)
      console.log(json);
      socket.emit("output-sync-req",{id,output:json.output})
      // setOutput(json.output)

    } catch (error) {
      socket.emit("output-sync-req",{id,output:error.message})
      console.log(error.message)
    }

  
  }

  


const myMeeting = async(element)=>{
  const appID = "your app id";
  const serverSecret = "server secret ";
  const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, id, Date.now().toString(), username);
  const zp = ZegoUIKitPrebuilt.create(kitToken);

  zp.joinRoom({
    container:element,
    scenario: {
      mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
    },
    showScreenSharingButton:false
  })
}



  useEffect(() => {

    console.log(codeText)
    const socket = io('http://localhost:3000/');
    socket.emit("room-join", { username: username, roomId: id })
    //  navigate('/code/'+roomId)
    socket.on("joined", (msg) => {
      toast(msg.username + " Joined " + msg.roomId)

    })
    socket.emit("users-info", id);
    socket.on("users", (roomUsers) => {
      console.log(roomUsers)
      setUsers(roomUsers)
    })


    socket.on("code-sync", (msg) => {
      // console.log(msg)
      setCodeText(msg)
    })

    socket.on("output-sync",(msg)=>{
      setOutput(msg)

      console.log(msg)
    })
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });






    return () => {
      socket.disconnect();
    }

  }, [])
  return (
    <>
    <div className= ' max-md:hidden  max-lg:hidden -z-10 w-full h-[100vh] text-slate-400 bg-slate-900  flex justify-center items-center   flex-col  p-10 '>
      <img className=' absolute  -z-0 top-0 right-0 backdrop-blur-lg' src='https://tailwindcss.com/_next/static/media/docs-dark@30.1a9f8cbf.avif' />

      <div className=' w-full h-full z-30 flex'>

        <div className='    w-72 h-[98%] bg-gray-500/50 rounded-lg p-2 justify-center items-start'>

          <div className=' h-[70%]' >
            <div className=' m-1  text-md text-gray-300 font-bold '>
              Connected Users :
            </div>

            {users.map((user, index) => {
              return <Avatar key={index} name={user.username} size='45' className='  rounded-lg  m-1 ' textSizeRatio={2.5} />
            })}


          </div>

          <div className=' h-[30%]  w-full flex flex-col justify-center '>
            <p className=' pl-1 mb-1 font-bold text-white'>Room Id:</p>
            <div className=' w-full h-9 rounded-lg bg-gray-500/50 backdrop-blur-lg mb-2 flex  items-center p-2 text-ellipsis overflow-hidden'>
              <p className=' text-gray-200 text-ellipsis  whitespace-nowrap overflow-hidden  '>{id}</p>
            </div>
            <button onClick={handlerCopyRoomId} className=' text-white mb-2 bg-gradient-to-r  from-green-300 to-green-500/80  w-full h-9 rounded-lg '>Copy Room ID</button>
            <button className=' text-white bg-gradient-to-r from-cyan-500 to-blue-500  w-full h-9 rounded-lg' onClick={handlerLeaveRoom}>Leave</button>
          </div>
        </div>

        <div className='  ml-3 w-full h-full  rounded-lg flex'>
          {/* <textarea   placeholder=' Code here'  className=' w-full h-full bg-gray-500/50 rounded-lg  text-white p-3 ' name="" id="" cols="30" rows="10"></textarea> */}

          <AceEditor className=' text-white bg-gray-500/50   h-96  rounded-lg'
            mode="javascript" // specify the language mode
            theme="monokai" // specify the theme
            fontSize={18}

            value={codeText}
            // onChange={newValue => console.log('change', newValue)} // handle change event
            onChange={handlerCodewriter}
            name="codeeditor" // unique ID for the editor
            editorProps={{ $blockScrolling: true }}
            // editor props

            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
            }}
          // set options

          />

          <div className=' w-96 h-[99%] rounded-lg ml-5'>
          <div className=' w-full flex justify-end'>
          <button className=' w-20 text-sm h-8 mb-2 bg-blue-500 text-white rounded-md' onClick={handlerCodeRun}>Run Code </button>
          </div>
            <div className=' w-full   h-[44%]  bg-gray-500/40 p-3  rounded-lg'>
              <p className=' font-bold text-white '>OUTPUT</p>
              <div className='  h-[90%]  overflow-y-auto '>
               {outputWithBreaks}
              </div>
            </div>

            <div   className=' w-full  mt-[2%]  h-[44%]  bg-gray-500/40 rounded-lg '>
           <div ref={myMeeting}>

           </div>

            </div>


          </div>

         
        </div>

      </div>

      <div className=' w-full h-10 absolute bottom-0 flex justify-center items-center'>
   Developed By Tarun Kataria With ♥
 </div>



    </div>
  <NotWorking/>
    </>
  )
}

export default CodeRoom