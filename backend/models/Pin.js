import mongoose from "mongoose";

const PinSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 20,   
    },

    title: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    desc: {
        type: String,
        required: true,
        minlength: 3
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    }
},
{timestamps: true}
);

export default mongoose.model("Pin", PinSchema);