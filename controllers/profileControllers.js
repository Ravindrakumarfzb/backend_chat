const express = require("express");
const cloudinary = require('cloudinary').v2;
const ProfileModel = require("../model/User");
require('dotenv').config();
// Configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret:process.env.api_secret // Click 'View API Keys' above to copy your API secret
});


const fileUpload = require('express-fileupload');
const app = express();
app.use(fileUpload({
    useTempFiles: true
}));

exports.UpdateProfile = async (req, res) => {
    try {
        const updatedUser = await ProfileModel.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        ).select('email userName isAdmin userType profilePic updatedAt')
        res.status(200).send({ user: updatedUser });
    } catch (err) {
        res.status(500).send(err);
    }
};


// const user = await ProfileModel.findById(req.params.id);
// if (user) {

//     user.username = req.body.username || user.username;
//     user.email = req.body.email || user.email;
//     user.profilePic = req.file.path || user.profilePic;
//     user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
//     user.description = req.body.description || user.description;
//     const updatedUser = await user.save();
//     res.json({
//         message: "Profile updated successfully",
//     });
// } else {

//     res.status(404).json("Profile Not Found")
// }





exports.UpdateProfilePic = async (req, res) => {
    try {
      const file = req.files.profilePic.tempFilePath;
        cloudinary.uploader.upload(file, { public_id: `profile-img_${Date.now()}` }, async (err, result) => {
            const updatedUser = await ProfileModel.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { profilePic: result.url },
                },
                { new: true }
            ).select('email userName isAdmin userType profilePic updatedAt')
            
            res.status(200).send({ user: updatedUser });

        })
    } catch (ex) {
        console.log(ex);

    }
};
