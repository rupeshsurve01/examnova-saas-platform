const express = require("express");
const dotenv = require("dotenv"); // This loads all variables from .env file into: process.env
const cors = require("cors");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes")
const attemptRoutes = require("./routes/attemptRoutes")
const orgRoutes = require("./routes/organizationRoutes");
const { setIo } = require("./socket");

const http = require("http");
const { Server } = require("socket.io");


dotenv.config();
connectDB()

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://examnova-saas-platform.vercel.app",
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

setIo(io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-teacher-room", (teacherId) => {
    const roomName = `teacher:${teacherId}`;
    socket.join(roomName);
    console.log(`Teacher joined room: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});



// Middleware
app.use(express.json()); //1.Allows server to read JSON data from request body 2.Used in POST/PUT requests
app.use(cors()); // Cross-Origin Resource Sharing
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes)
app.use("/api/student", attemptRoutes)
app.use("/api/org", orgRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("ExamNova API is running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
