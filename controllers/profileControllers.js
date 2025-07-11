const express = require("express");
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const UserModel = require("../model/User");
require('dotenv').config();
// Configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret:process.env.api_secret // Click 'View API Keys' above to copy your API secret
});


const app = express();
app.use(fileUpload({
    useTempFiles: true
}));

exports.UpdateProfile = async (req, res) => {
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        ).select('email userName isAdmin userType imageUrl updatedAt')
        res.status(200).send({ user: updatedUser });
    } catch (err) {
        res.status(500).send(err);
    }
};



exports.UpdateProfilePic = async (req, res) => {
    try {
      const file = req?.files?.imageUrl?.tempFilePath;
        cloudinary.uploader.upload(file, { public_id: `profile-img_${Date.now()}` }, async (err, result) => {
            const updatedUser = await UserModel.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { imageUrl: result.secure_url },
                },
                { new: true }
            ).select('email userName isAdmin userType imageUrl updatedAt')
            
            res.status(200).send({ user: updatedUser });

        })
    } catch (ex) {
        console.log(ex);

    }
};
