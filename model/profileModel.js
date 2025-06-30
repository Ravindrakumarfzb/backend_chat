const mongoose = require("mongoose");

const ProfileSchema = mongoose.Schema(
    {
        userName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePic: { type: String, default: "uploads/default.png" },
        mobileNumber: { type: Number, default: "0" },
        about: { type: String, default: null },
        isOnline: { type: Boolean, default: false },
    },

    { timestamps: true }
);

// export model user with UserSchema
module.exports = mongoose.model("Profile", ProfileSchema);
