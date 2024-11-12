const mongoose = require("mongoose");
require('dotenv').config();


 const MONGOURI = process.env.MongoDB_URL;
 
const InitiateMongoServer = async () => {
  try {
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true
    });
    console.log(" Database Connected successfully", new Date().toDateString());
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = InitiateMongoServer;