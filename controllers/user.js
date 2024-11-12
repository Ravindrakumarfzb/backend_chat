const { check, validationResult } = require("express-validator");
const User = require("../model/User");
const Otp = require("../model/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.UserSignUp= async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const {
      username,
      email,
      password
    } = req.body;
    try {
      let user = await User.findOne({
        email
      });
      if (user) {
        return res.status(422).json({
          msg: "User Already Exists"
        });
      }

      user = new User({
        username,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString", {
        expiresIn: 10000
      },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({
            status: 200,
            message: "User created successfully", token: token
          });
        }
      );
    } catch (err) {
      res.status(500).send("Error in Saving");
    }
  }


  exports.UserLogin= async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email
      });
      if (!user)
        return res.status(400).json({
          message: "User Not Exist"
        });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });

      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 36000
        },
        (err, token) => {
          
          if (err) 
          throw err;
          res.status(200).json(
            {
            token,
            user,
            user:{
              _id:user._id,
              userName:user.username,
              email:user.email,
             // createdAt:new Date(user.createdAt),
              updatedAt:new Date(user.updatedAt),
              isAdmin:user.isAdmin,
              userType:user.userType,
              profilePic:user.profilePic,
            }
          });
         
          console.log("LoggedIn Successfully");
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }

  exports.UpdateUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    const salt = await bcrypt.genSalt(10);
    // password = await bcrypt.hash(req.body.password, salt);
    // console.log(password);
    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
      user.description = req.body.description || user.description;
      const updatedUser = await user.save();
      res.json({message:"Profile updated successfully",
      updatedUser:{
          _id:user._id,
          userName:updatedUser.username,
          email:updatedUser.email,
          updatedAt:user.updatedAt,
          isAdmin:updatedUser.isAdmin,
          userType:updatedUser.userType,
          profilePic:updatedUser.profilePic,
          mobileNumber:updatedUser.mobileNumber,
          description:updatedUser.description,
        }
      });
    } else {

      res.status(404).json("User Not Found")
    }
  };



  exports.UpdateProfilePic = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.profilePic = req.file.path || user.profilePic;
      user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
      user.description = req.body.description || user.description;
      const updatedUser = await user.save();
      res.json({message:"Profile updated successfully",
      });
    } else {

      res.status(404).json("User Not Found")
    }
  };

  exports.findByIdUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("username email updatedAt profilePic mobileNumber description ")
      res.json(user);
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }}

  exports.FindAllUserList =async (req,res)=>{
    try {
      const user = await User.find({isAdmin:false});
      console.log(user);
      res.json({user:user.map(user=>{
        return {
         name:user.username,
         email:user.email,
         _id:user._id,
         isOnline:user.isOnline,
         createdAt:user.createdAt,
         updatedAt:user.updatedAt,
         profilePic:user.profilePic,
       }})
     });
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  }

  // const nodemailer = require('nodemailer');
  // const transporter= nodemailer.createTransport({
  //   host:'smtp.gmail.com',
  //   port:587,
  //   secure:false,
  //   requireTLS:true,
  //   auth:{
  //     user:'ravindrafzb1270@gmail.com',
  //     pass:'Ravindra$1234'
  //   }
  // });

  // var mailOptions = {
  //   from: 'ravindra609@gmail.com',
  //   to: 'ravindrafzb1270@gmail.com',
  //   subject: 'Sending Email using Node.js',
  //   text: 'That was easy!'
  // };
  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });

  exports.emailSend =async (req,res)=>{
    try {
    const user = await User.findOne({email:req.body.email});;
    if(user)
    {
      let otpcode = Math.floor((Math.random()*100000)+1);
      let otpData=new Otp({
        email:req.body.email,
        code:otpcode,expiresIn:new Date().getTime()+300*1000
      })
      let otpResponse=await otpData.save();
      res.status(200).send({message:"Success",otpResponse:otpResponse});
    }
    else{
      res.status(200).send("Failed");
    }

    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  }

  exports.changePassword =async (req,res)=>{
    try {
     // const user = await User.find({isAdmin:false});
      res.status(200).send("aa");
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  }
