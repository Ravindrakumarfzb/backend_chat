const express = require("express");
const bodyParser = require("body-parser");
const socket = require('socket.io');
const multer = require('multer');
const path = require('path');
//new addition
const InitiateMongoServer = require("./config/db");
const morgan = require('morgan');

// Initiate Mongo Server
InitiateMongoServer();
const cors = require('cors');
const app = express();
var http = require('http').createServer(app);
app.use(cors());
// Middleware
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const messageRoutes = require('./routes/messagesRoute');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const user = require("./routes/user");
const User = require("./model/User");
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("E-commerce api working");
});
app.use(morgan('dev'))
// CORS HEADERS MIDDLEWARE
app.use("/user", user);
app.use("/message",messageRoutes);


// Configure multer for file uploads
const storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'./uploads')
  },
  filename:function(req,file,cb){
    cb(null,file.originalname);
  }
});

const upload = multer({ storage });

// Serve static files from the uploads directory
// app.use('/uploads', express.static('uploads'));



//error handling api
// app.use((req, res, next) => {
//   const error = new Error('Not found');
//   error.status = 404;
//   next(error)
// });
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
})
http.listen(process.env.PORT || PORT, (req, res) => {
  console.log(`Server Started at:- http://localhost:${process.env.PORT}`);
});
const io = socket(http, {
  cors: {
    origin: "http://localhost:4200",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", async (socket) => {
  global.chatSocket = socket;
  socket.on('user-online',async (userId)=>
  {
  const data=await User.findByIdAndUpdate({_id:userId.user._id},{$set:{isOnline:true}},{ new: true })
  socket.broadcast.emit("getOnlineUser",{data})
  })
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
    socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-received", data);
    }
  });
});

app.post('/upload', upload.single('image'), (req, res) => {
  const imageUrl = `https://backend-chat-jpq4.onrender.com/uploads/${req.file.filename}`;
  // const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
  io.emit('imageUploaded', { imageUrl }); // Emit to all connected clients
  res.json({ imageUrl });
});
// app.post('/upload', upload.single('images'), (req, res) => {
//   debugger
//   io.emit('fileUploaded', req.file);
//   res.sendStatus(200);
// });

io.on('disconnect', async ()=>{
  console.log("user Disconnected");
  const data=await User.findByIdAndUpdate({_id:userId.user._id},{$set:{isOnline:false}},{ new: true })
  //socket.broadcast.emit("getOfflineUser",{userId})
})