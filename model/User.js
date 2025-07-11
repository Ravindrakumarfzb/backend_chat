const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    imageUrl: { type: String, default: 'https://res.cloudinary.com/djcysaola/image/upload/v1752136061/chat-img_1752136058366.png' },
    mobileNumber: { type: Number, default: "0" },
    description: { type: String, default: "0" },
    isOnline: { type: Boolean, default: false },
    userType: { type: String, default: "Admin_Panel"},
    acceptInvite:{type:Boolean,default:false},

  },

  { timestamps: true }
);

// export model user with UserSchema
module.exports = mongoose.model("User", UserSchema);
