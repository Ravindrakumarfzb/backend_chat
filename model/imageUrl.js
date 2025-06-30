const mongoose = require("mongoose");

const ImageUrlSchema = mongoose.Schema(
  {
      imageUrl: { type: String, default:null},
      userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ImageUrl", ImageUrlSchema);
