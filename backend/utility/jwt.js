import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (username) => {
  if (!username) {
    throw new Error("Username is required to generate a token");
  }
  return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
};



export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(403).json({ error: "Invalid token" });
  }
};

export default generateToken;