const mongoose = require("mongoose");
// Convention: Capital 'S' use karein
const Schema = mongoose.Schema; 

const dataSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username dalna zaroori hai!"], // Custom error message ke saath
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "postimage" // Filename ke liye bhi default rakhna safe rehta hai
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1480796927426-f609979314bd",
            // Fix: undefined ya empty dono ko handle karega
            set: (v) => v === "" || !v ? "https://images.unsplash.com/photo-1480796927426-f609979314bd" : v
        }
    }
});

const Data = mongoose.model("Data", dataSchema);
module.exports = Data;