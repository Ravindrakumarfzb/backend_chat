const { check, validationResult } = require("express-validator");
const User = require("../model/User");
const Otp = require("../model/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.UserSignUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  const {userName,email,password} = req.body;
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
      userName,
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


exports.UserLogin = async (req, res) => {
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
            user: {
              _id: user._id,
              userName: user.userName,
              email: user.email,
              // createdAt:new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
              isAdmin: user.isAdmin,
              userType: user.userType,
              profilePic: user.profilePic,
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

exports.findByIdUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("userName email updatedAt profilePic mobileNumber description ")
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
}

exports.FindAllUserList = async (req, res) => {
  try {
    const user = await User.find();
    res.json({
      user: user.map(user => {
        return {
          userName: user.userName,
          email: user.email,
          _id: user._id,
          isOnline: user.isOnline,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profilePic: user.profilePic,
        }
      })
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

exports.emailSend = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });;
    if (user) {
      let otpcode = Math.floor((Math.random() * 100000) + 1);
      let otpData = new Otp({
        email: req.body.email,
        code: otpcode, expiresIn: new Date().getTime() + 300 * 1000
      })
      let otpResponse = await otpData.save();
      res.status(200).send({ message: "Success", otpResponse: otpResponse });
    }
    else {
      res.status(200).send("Failed");
    }

  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
}

exports.changePassword = async (req, res) => {
  try {
    // const user = await User.find({isAdmin:false});
    res.status(200).send("aa");
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
}
