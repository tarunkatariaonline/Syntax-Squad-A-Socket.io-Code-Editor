const express = require('express');
const { createServer } = require('http');

const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


let users = [];
app.get('/', (req, res) => {
 res.send("hello world")
});

io.on('connection', (socket) => {
  socket.on("msg",(msg)=>{
    console.log(msg)
    
  })

  socket.on("room-join",(msg)=>{
    socket.join(msg.roomId);
    msg.socketId = socket.id
    users.push(msg);
    console.log("room joined successfully")
    socket.to(msg.roomId).emit('joined', msg);

    
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

  socket.to(msg.id).emit("cods",msg.newValue)
  

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