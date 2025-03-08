import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import pinRoute from "./routes/pins.js";
import userRoute from "./routes/users.js";
import cors from "cors";
import  {verifyToken}  from "./utility/jwt.js";


 
dotenv.config();

const app = express();

app.use(express.json());





app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
  })
);


console.log('MongoDB URL:', process.env.Mongo_url);

  
 


mongoose.connect(process.env.Mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
 }).then(() => {
    console.log("database connected");
 })
 .catch((err) => console.log(err));

 app.use("/api/pins", pinRoute);
 app.use("/api/users", userRoute);

 //verify token
 
  
  
  

 

app.listen(8800, ()=>{
    console.log("backend listening");
});


