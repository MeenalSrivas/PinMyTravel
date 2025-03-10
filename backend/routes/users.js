import express from "express";
import User from "../models/User.js";
import generateToken, { verifyToken } from "../utility/jwt.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    
    // Extract the token from the Authorization header
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : authHeader;
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - Invalid token format" });
    }
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Attach user data to the request
      next();
    } catch (error) {
      console.error("Invalid token:", error);
      res.status(403).json({ error: "Invalid or expired token" });
    }
};

// Verify token endpoint
router.get("/verify", authenticateToken, (req, res) => {
    // If middleware passes, the token is valid
    res.status(200).json({ 
        valid: true, 
        username: req.user.username 
    });
});

//register
router.post("/register", async(req, res) => {
    try {
        // Check if required fields are provided
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Check if username or email already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: "Username already exists" });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ error: "Email already exists" });
            }
        }
        
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        
        // Generate new password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        
        // Save user to database
        const user = await newUser.save();

        // Generate a JWT
        const token = generateToken(user.username);
        console.log("Token generated:", token);

        // Return user data and token
        res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            }, 
            token
        });
    } catch (err) {
        console.error("Registration error:", err);
        
        // Handle MongoDB duplicate key error
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ 
                error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
            });
        }
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        
        res.status(500).json({ error: "Server error during registration" });
    }
});

//login
router.post("/login", async(req, res) => {
    try {
        // Find the user
        const user = await User.findOne({username: req.body.username});
        if (!user) {
            return res.status(400).json("Wrong username or password");
        }
       
        // Compare password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json("Wrong username or password");
        }
        
        // Generate token
        const token = generateToken(user.username);
        console.log("Token generated for user:", user.username);
        
        // Return consistent user data structure
        res.status(200).json({
            username: user.username,
            _id: user._id,
            id: user._id, // Include both _id and id for compatibility
            token: token
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

export default router;