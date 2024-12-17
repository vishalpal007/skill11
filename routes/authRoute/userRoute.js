const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// Import controller methods
const {
    registerOrLoginUserUsingMobileNumber,
    logoutUser,
    verifyOtpForMobileNumber,
    registerOrLoginUsingEmail,
    verifyOtpForEmail,
} = require("../../controllers/auth/userController");

// Import middleware

// Set up rate limiters
const otpLimiterSms = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    message: "Too many OTP requests from this IP, please try again later.",
});

const otpLimiterEmail = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: "Too many email OTP requests from this IP, please try again later.",
});

// Routes for Mobile OTP functionality
router
    .post("/mobile/register-login", otpLimiterSms, registerOrLoginUserUsingMobileNumber)
    .post("/mobile/verify-otp", verifyOtpForMobileNumber)

// Routes for Email OTP functionality
router
    .post("/email/register-login", otpLimiterEmail, registerOrLoginUsingEmail)
    .post("/email/verify-otp", verifyOtpForEmail)

// Common routes
router.post("/logout", logoutUser);

module.exports = router;
