import express from "express";
import Pin from "../models/Pin.js";
import verifyToken from "../utility/jwt.js";

const router = express.Router();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    
    // Extract the token from the Authorization header
    // Support both "Bearer <token>" and just "<token>" formats
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - Invalid token format" });
    }
    
    try {
      console.log("Verifying token:", token.substring(0, 10) + "...");
      const decoded = verifyToken(token);
      req.user = decoded; // Attach user data to the request
      console.log("Token verified for user:", decoded.username);
      next();
    } catch (error) {
      console.error("Invalid token:", error);
      res.status(403).json({ error: "Invalid or expired token" });
    }
};

// Creating a pin
router.post("/", authenticateToken, async (req, res) => {
    const newPin = new Pin(req.body);
    try {
        const savePin = await newPin.save();
        return res.status(200).json(savePin);
    } catch (err) {
        res.status(500).json(err);
    }
});

//getting all the pins
router.get("/", authenticateToken, async (req, res) => {
    try {
      // Get the username from the query parameter or from the authenticated user
      const username = req.query.username || req.user.username;
      
      // Get pins for the specific user
      const pins = await Pin.find({ username: username });
      
      return res.status(200).json(pins);
    } catch (err) {
        console.error("Error fetching pins:", err);
        res.status(500).json({ error: "Failed to fetch pins" });
    }
});

export default router;
