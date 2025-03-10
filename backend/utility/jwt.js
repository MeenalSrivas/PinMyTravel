import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate a JWT token for a username
const generateToken = (username) => {
  if (!username) {
    throw new Error("Username is required to generate a token");
  }
  console.log("Token generated for user:", username);
  return jwt.sign({ username }, process.env.JWT_SECRET || "fallbacksecret", { expiresIn: "7d" });
};

// Verify a JWT token and return the decoded data
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required for verification");
  }
  
  try {
    console.log("Verifying token:", token.substring(0, 10) + "...");
    // Use fallback secret if environment variable is not set
    const secret = process.env.JWT_SECRET || "fallbacksecret";
    const decoded = jwt.verify(token, secret);
    console.log("Token verified for user:", decoded.username);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    throw new Error("Invalid token: " + error.message);
  }
};

export default generateToken;
export { verifyToken };