const express = require("express");
const dotenv = require("dotenv"); // This loads all variables from .env file into: process.env
const cors = require("cors");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB()

const app = express();

// Middleware
app.use(express.json()); //1.Allows server to read JSON data from request body 2.Used in POST/PUT requests
app.use(cors()); // Cross-Origin Resource Sharing
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("ExamNova API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});