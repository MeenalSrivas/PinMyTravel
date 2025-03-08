import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require :true,
        min: 3,
        max: 20, 
        unique: true,  
    },

    email: {
        type: String,
        require: true,
        max: 50,
        unique: true,

    },
    password:{
        type: String,
        required: true,
        min:6,
    },
},
    {timestamps: true}

);

export default mongoose.model("User", UserSchema );