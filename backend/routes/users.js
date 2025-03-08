import express from "express";
import User from "../models/User.js";
import generateToken from "../utility/jwt.js";


import bcrypt from "bcrypt";

const router = express.Router();



//register

router.post("/register", async(req, res) =>{
    try{
        // generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,


    });
    const user = await newUser.save();

     // Generate a JWT
    const token = generateToken(user.username);
    console.log("tokenGenrated:", token);

    user.token =token
     

    res.status(200).json({user, token});


    }catch(err){
        res.status(500).json(err);

    }
    

    

});


//login


router.post("/login", async(req, res) =>{
    try{
        // find the user
        const user = await User.findOne({username: req.body.username});
        if (!user){
            return res.status(400).json("Wrong Username or password");
        }
       

    //Comparing password
    const validpassword = await bcrypt.compare(req.body.password,user.password);
    if (!validpassword){

        return res.status(400).json("Wrong Username or password");

    }
    const token = generateToken(user.username);
    console.log("tokenGenrated:", token);
        res.status(200).json({
            token,
            _id: user._id,
            username: user.username,
        });
        
        

    
    }catch(err){
        res.status(500).json(err);

    }

});


export default router