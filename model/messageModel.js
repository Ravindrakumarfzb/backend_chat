const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
      message: {type: String, required: false,default:null},
      imageUrl: { type: String, default:null },
      sendAudio: { type: String, default:null },
      users: [{ type: mongoose.Schema.Types.ObjectId,ref: 'User'}],
      sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
