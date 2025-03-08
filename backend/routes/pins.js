import express from "express";
import Pin from "../models/Pin.js";
import  verifyToken  from "../utility/jwt.js" ;


const router = express.Router();
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Attach user data to the request
      next();
    } catch (error) {
      console.error("Invalid token:", error);
      res.status(403).json({ error: "Invalid token" });
    }
  };

// Creating a pin

router.post("/",authenticateToken, async (req,res)=>{
    const newPin= new Pin(req.body);
    try{
        const savePin =  await newPin.save();
         return res.status(200).json(savePin);


    }catch(err){
        res.status(500).json(err);
    }


});

//getting all the pins
router.get("/" ,authenticateToken, async (req, res)=>{
    try{
      const username = req.query.username;
      let pins
      if (username) {
        // Get pins for a specific user
        pins = await Pin.find({ username: username });
        
        console.log(pins);
        return res.status(200).json(pins);

    }
  }catch(err){
        res.status(500).json(err);
        
    }
})

export default router;
