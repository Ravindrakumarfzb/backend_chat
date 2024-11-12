const mongoose = require("mongoose");
const AddressSchema = mongoose.Schema
    ({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
                streetAddress:{type: String, required: true },
                zipcode: { type: Number, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                country: { type: String, required: true },
    },
        { timestamps: true }
    );
// export model user with UserSchema
module.exports = mongoose.model("Address", AddressSchema); 