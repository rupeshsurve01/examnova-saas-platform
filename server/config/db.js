const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);//${conn.connection.host} prints the hostname (server address) of the MongoDB database your app is connected to.
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);//Stops server Immediately
  }
};
 
module.exports = connectDB;
 