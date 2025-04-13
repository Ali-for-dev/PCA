const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Add these imports at the top of authController.js
const crypto = require('crypto');
const { generateOTP, hashOTP } = require('../utils/otpUtils');
const sendEmail = require('../utils/sendEmail');

// Modify the registerUser function to not auto-login after registration
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, phoneNumber, address, role } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
        address,
        role
    });

    // Generate and send OTP right after registration
    const otp = generateOTP();
    
    // Set OTP expire time (10 minutes)
    const otpExpire = Date.now() + 10 * 60 * 1000;
    
    // Save hashed OTP to database
    user.otpCode = hashOTP(otp);
    user.otpExpire = otpExpire;
    await user.save({ validateBeforeSave: false });

    // Prepare email message
    const message = `Welcome to our platform, ${user.name}!\n\nYour OTP for account verification is: ${otp}.\nThis code will expire in 10 minutes.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome! Verify Your Account',
            message
        });

        res.status(201).json({
            success: true,
            message: `User registered successfully. OTP sent to: ${user.email}`
        });
    } catch (error) {
        user.otpCode = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler('Error sending verification email', 500));
    }
});

// Login user => /api/v1/auth/login
// Also modify loginUser to check for verification
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    // Finding user in database
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    // Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    // Check if user is verified
    if (!user.isVerified) {
        return next(new ErrorHandler('Please verify your account first', 401));
    }

    const token = user.getJwtToken();

    // Set cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    };

    res.status(200)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            user
        });
});
// Logout user => /api/v1/auth/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out'
    });
});

// Get currently logged in user details => /api/v1/auth/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

// Generate OTP for user verification => /api/v1/auth/send-otp
exports.sendOTP = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    // Find user with this email
    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Set OTP expire time (10 minutes)
    const otpExpire = Date.now() + 10 * 60 * 1000;
    
    // Save hashed OTP to database
    user.otpCode = hashOTP(otp);
    user.otpExpire = otpExpire;
    await user.save({ validateBeforeSave: false });

    // Prepare email message
    const message = `Your OTP for verification is: ${otp}.\nThis code will expire in 10 minutes.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Account Verification OTP',
            message
        });

        res.status(200).json({
            success: true,
            message: `OTP sent to: ${user.email}`
        });
    } catch (error) {
        user.otpCode = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});



// Verify OTP code => /api/v1/auth/verify-otp
exports.verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const { email, otp } = req.body;

    // Hash OTP for comparison
    const hashedOTP = hashOTP(otp);

    // Find user with this email, OTP and not expired
    const user = await User.findOne({
        email,
        otpCode: hashedOTP,
        otpExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('OTP is invalid or has expired', 400));
    }

    // Set user as verified
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = user.getJwtToken();

    // Set cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    };

    res.status(200)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            message: 'Account verified successfully',
            token,
            user
        });
});
