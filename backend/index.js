const express = require('express');
const { createServer } = require('http');
var bodyParser = require('body-parser')
var cors = require('cors')
var vm = require('vm')


const { Server } = require('socket.io');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors({
  
  origin:"*",
  credentials:true,
  methods:["GET","POST"]
  
 
}))

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],

  },
});


let users = [];
let roomData = {}; 



io.on('connection', (socket) => {
  socket.on("msg",(msg)=>{
    console.log(msg)
    
  })

  socket.on("room-join",(msg)=>{
    socket.join(msg.roomId);
    msg.socketId = socket.id
    if (!roomData[msg.roomId]) {
      roomData[msg.roomId] = {
        code: 'console.log("Hello, World!");',
        language: {
          id: 63,
          name: "JavaScript (Node.js 12.14.0)",
          code: 'console.log("Hello, World!");'
        },
        output: ''
      };
    }

    msg.language = roomData[msg.roomId].language;
    msg.codeValue = roomData[msg.roomId].code;
    msg.output = roomData[msg.roomId].output;
    users.push(msg);
    console.log("room joined successfully")
    socket.to(msg.roomId).emit('joined', msg);
    socket.emit('sync-everything', msg);

    
  })


 socket.on("users-info",(roomid)=>{
  const roomUsers = users.filter((user)=>user.roomId===roomid);


  console.log(roomid)
 io.to(roomid).emit('users',roomUsers);
  console.log(roomUsers)
  console.log("users send successfully.")

 })

 socket.on('codebase',(msg)=>{
  // console.log(msg)

  const room = msg.id;
  const codeValue = msg.newValue;
  
    if (roomData[room]) {
      roomData[room].code = codeValue;
    }

  // Broadcast the updated code to everyone in the room except the sender
  socket.broadcast.to(room).emit('code-sync', codeValue);

 })

  socket.on('language-sync-req',(msg)=>{
  // console.log(msg)
  const room = msg.id;
  const language =  msg.language;
   if (roomData[room]) {
      roomData[room].language = language;
    }

  // Broadcast the updated code to everyone in the room except the sender
  socket.broadcast.to(room).emit('language-sync',language);

 })


 socket.on('output-sync-req',(msg)=>{
  console.log("Output request")
   if (roomData[room]) {
      roomData[room].output = output;
    }
  socket.to(msg.id).emit("output-sync",msg.output)
 })
 socket.on("disconnect", (msg) => {
  const disconnectUser = users.find((user)=>user.socketId===socket.id);
  console.log(disconnectUser?.roomId)
  const connectedUsers = users.filter((user)=>user.socketId!==socket.id)

  users = connectedUsers;
  io.to(disconnectUser?.roomId).emit('users',users);
  // console.log(socket.id); // undefined
});

});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});