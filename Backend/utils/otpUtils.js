// backend/utils/otpUtils.js
const crypto = require('crypto');

// Generate a random 6-digit OTP
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before saving to database
exports.hashOTP = (otp) => {
    return crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
};