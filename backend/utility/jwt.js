import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate a JWT token for a username
const generateToken = (username) => {
  if (!username) {
    throw new Error("Username is required to generate a token");
  }
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Verify a JWT token and return the decoded data
const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required for verification");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    throw new Error("Invalid or expired token");
  }
};

export default generateToken;
export { verifyToken };