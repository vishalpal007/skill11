const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    otp: {
        type: String,
        select: false,
    },
    otpExpiry: {
        type: Date,
        select: false
    },
    role: {
        type: String,
        default: "user"
    }
}, { timestamps: true })


module.exports = mongoose.model("user", userSchema)