import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import pinRoute from "./routes/pins.js";
import userRoute from "./routes/users.js";
import cors from "cors";
import  {verifyToken}  from "./utility/jwt.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Optimize for serverless environment
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.static('./frontend/build'));

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "https://pinmytravel.onrender.com", "https://pin-my-travel-klro.vercel.app"],
     // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
  })
);

console.log('MongoDB URL:', process.env.Mongo_url);

// Set mongoose connection options for better performance in serverless environments
mongoose.set('bufferCommands', false); // Disable mongoose buffering
mongoose.set('strictQuery', true); // Strict query for better performance

// MongoDB connection with timeout and serverless optimizations
mongoose.connect(process.env.Mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
 }).then(() => {
    console.log("database connected");
 })
 .catch((err) => {
    console.log("MongoDB connection error:", err);
    // Don't crash the server on connection error
 });

// API Routes
app.use("/api/pins", pinRoute);
app.use("/api/users", userRoute);

// Root route - optimized for quick response
app.get("/", (req, res) => {
  res.status(200).json({
    activeStatus: true,
    error: false,
    message: "Travel Map API is running"
  });
});

// Health check endpoint for Vercel
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Export the Express API
export default app;

// Start server only if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8800;
  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
} else {
  console.log("Running in production mode");
}
