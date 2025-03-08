import mongoose from "mongoose";

const PinSchema = new mongoose.Schema({
    username: {
        type: String,
        require :true,
        min: 3,
        max: 20,   
    },

    title: {
        type: String,
        require: true,
        max: 3
        

    },
    desc:{
        type: String,
        require: true,
        min:3,
    },
    rating:{
        type: Number,
        min:0,
        max:5,
        require: true,

    },
    lat:{
        type:Number,
        require:true,
    },
    long:{
        type:Number,
        require:true,
    },

},
    {timestamps: true}

);

export default mongoose.model("Pin", PinSchema);