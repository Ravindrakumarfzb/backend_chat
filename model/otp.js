const mongoose = require("mongoose");

const OtpSchema = mongoose.Schema(
  {
    email:String ,
    code: String,
    expireIn: Number,
  },

  { timestamps: true }
);

// export model user with UserSchema
module.exports = mongoose.model("otp", OtpSchema);
