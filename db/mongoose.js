const mongoose = require("mongoose");
const config = require("../config/config");

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb, {
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB connection estblished succesfully");
});

module.exports = { mongoose };
