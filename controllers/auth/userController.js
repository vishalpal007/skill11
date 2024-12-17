const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../modles/authModle/User');
const { sendOtp } = require('../../utils/sendOtp');
const sendEmail = require('../../utils/sendEmail');
const { OAuth2Client } = require("google-auth-library")

// Step 1: Register or login user by generating OTP
exports.registerOrLoginUserUsingMobileNumber = asyncHandler(async (req, res) => {
    try {
        const { phone, name, resend } = req.body;

        // Validate input
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // Check if the user exists
        let user = await User.findOne({ phone });

        if (!user) {
            if (resend) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Register a new user if not found
            user = await User.create({ name: name, phone });
        } else {
            if (name && !resend) {
                // Update name if provided during login
                user.name = name;
            }
        }

        // Generate OTP and set expiry
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save OTP and expiry to user
        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP to the user's phone number
        await sendOtp(phone, otp);

        // Respond with success message
        res.status(200).json({
            message: resend ? 'OTP resent successfully.' : 'OTP sent successfully.',
        });
    } catch (error) {
        console.error('Error in registerOrLoginUserUsingMobileNumber:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Step 2: Verify OTP and authenticate user
exports.verifyOtpForMobileNumber = asyncHandler(async (req, res) => {
    try {
        const { phone, otp } = req.body;

        // Validate input
        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone and OTP are required' });
        }

        // Find user by phone
        const user = await User.findOne({ phone }).select('+otp +otpExpiry');

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if OTP has expired
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Verify the OTP
        const isValidOtp = await bcrypt.compare(otp, user.otp);
        if (!isValidOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear OTP and expiry after successful verification
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
            expiresIn: '7d',
        });

        // Set authentication token as a cookie (optional)
        res.cookie('auth', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });

        // Determine action based on timestamps
        const action = user.createdAt.getTime() === user.updatedAt.getTime() ? 'registered' : 'logged in';

        // Respond with success message and user details
        res.status(200).json({
            message: `User successfully ${action}.`,
            token,
            user: {
                name: user.name,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


exports.registerOrLoginUsingEmail = asyncHandler(async (req, res) => {
    try {
        const { email, name, resend } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if the user exists
        let user = await User.findOne({ email });

        if (!user) {
            if (resend) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Register a new user if not found
            user = await User.create({ name: name, email });
        } else {
            if (name && !resend) {
                // Update name if provided during login
                user.name = name;
            }
        }

        // Generate OTP and set expiry
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save OTP and expiry to user
        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP to the user's email
        await sendEmail({
            to: email,
            subject: "Your OTP for Login/Registration",
            message: `Your OTP is ${otp}`,
            html: `<p>Your OTP for registration/login is: <b>${otp}</b></p>`
        });

        // Respond with appropriate message
        res.status(200).json({
            message: resend ? 'OTP resent successfully to email' : 'OTP sent successfully to email',
        });
    } catch (error) {
        console.error('Error in registerOrLoginUsingEmail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Step 2: Verify OTP sent to email
exports.verifyOtpForEmail = asyncHandler(async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email }).select('+otp +otpExpiry');

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if OTP has expired
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Verify OTP
        const isValidOtp = await bcrypt.compare(otp, user.otp);

        if (!isValidOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear OTP after successful verification
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
            expiresIn: '7d',
        });

        res.cookie('auth', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });

        res.status(200).json({
            message: 'User successfully authenticated via email',
            token,
            user: {
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Error in verifyOtpForEmail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





exports.continueWithGoogle = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: "Google credential is required" });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log("Google Payload:", payload);

        const { email, name, picture, phone } = payload;

        if (!email) {
            return res.status(400).json({ message: "Email is required from Google account" });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Register the user
            user = await User.create({
                name: name || "Guest User",
                email,
                avatar: picture || null,
                phone: phone || "",
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, { expiresIn: '7d' });

        // Set token in cookie
        res.cookie('auth', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });

        res.status(200).json({
            success: true,
            message: user.isNew ? "Registration successful" : "Login successful",
            user: {
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error("Google authentication error:", error.message);
        res.status(500).json({ message: "Google authentication failed" });
    }
});



exports.logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('auth');
    res.json({ message: 'Logged out successfully' });
});