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

app.post('/execute-js',async(req,res)=>{
  console.log("Hi i am here")
  const {code} = req.body;
 

  try {
    // Create a new sandbox for executing the JavaScript code
    const timeoutMilliseconds = 5000;
    const sandbox = { console }; // Include the console object for logging
    vm.createContext(sandbox);

    // Capture console output
     const executionTimeout = setTimeout(() => {
      // If execution exceeds the timeout, throw an error
      console.log("hello error")
    }, timeoutMilliseconds);
    let output = '';
    sandbox.console.log = (data) => {
      output += data + ' ';
    };

   

    // Execute the JavaScript code in the sandbox
    vm.runInContext(code, sandbox);

    res.status(200).send({ output });
    
  }  catch (error) {
    console.error('Error while executing code:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
})
// app.get('/', (req, res) => {
//  res.json({
//   res:"hello world"
//  });
// });

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

  const room = msg.id;
  const codeValue = msg.newValue;

  // Broadcast the updated code to everyone in the room except the sender
  socket.broadcast.to(room).emit('code-sync', codeValue);

 })


 socket.on('output-sync-req',(msg)=>{
  console.log("Output request")
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