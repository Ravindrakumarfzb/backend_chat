const express = require("express");
const bodyParser = require("body-parser");
const socket = require('socket.io');
const multer = require('multer');
const path = require('path');
//new addition
const ImageUrl = require("./model/imageUrl");

const InitiateMongoServer = require("./config/db");
const morgan = require('morgan');

const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret:process.env.api_secret // Click 'View API Keys' above to copy your API secret
});
// Initiate Mongo Server
InitiateMongoServer();
const cors = require('cors');
const app = express();
var http = require('http').createServer(app);
app.use(cors());
app.use(fileUpload({
  useTempFiles: true
}));
// Middleware
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const messageRoutes = require('./routes/messagesRoute');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const user = require("./routes/user");
const profiles = require("./routes/profiles");
const User = require("./model/User");
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("E-commerce api working");
});
app.use(morgan('dev'))

// CORS HEADERS MIDDLEWARE
app.use("/user", user);
app.use("/profile", profiles);
app.use("/message", messageRoutes);


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
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
  socket.on('user-online', async (userId) => {
    const data = await User.findByIdAndUpdate({ _id: userId.user._id }, { $set: { isOnline: true } }, { new: true })
    socket.broadcast.emit("getOnlineUser", { data })
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
io.on('disconnect', async () => {
  console.log("user Disconnected");
  const data = await User.findByIdAndUpdate({ _id: userId.user._id }, { $set: { isOnline: false } }, { new: true })
  //socket.broadcast.emit("getOfflineUser",{userId})
});


app.post('/upload', async (req, res) => {
  const file = req.files.image.tempFilePath;
  cloudinary.uploader.upload(file, { public_id: `chat-img_${Date.now()}` }, (err, result) => {
    io.emit('imageUploaded', { result });
    try {
      const data = new ImageUrl({ imageUrl: result.url, userID: req.body.userID });
      const savedAddress = data.save();
      if (data)
        return res.status(200).send({ msg: 200, data });
      else
        return res.json({ msg: "Failed to add message to the database" });
    } catch (ex) {
      console.log(ex);

    }
  })
})
