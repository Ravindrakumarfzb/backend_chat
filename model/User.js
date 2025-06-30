const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    profilePic: { type: String, default: null },
    mobileNumber: { type: Number, default: "0" },
    description: { type: String, default: "0" },
    isOnline: { type: Boolean, default: false },
    userType: { type: String, default: "Admin_Panel" },
  },

  { timestamps: true }
);

// export model user with UserSchema
module.exports = mongoose.model("User", UserSchema);
