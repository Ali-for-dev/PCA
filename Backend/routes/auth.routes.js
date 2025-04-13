// Update backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    logout,
    getUserProfile,
    sendOTP,
    verifyOTP
} = require('../controllers/authController');

const { isAuthenticatedUser } = require('../middlewares/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/send-otp').post(sendOTP);
router.route('/verify-otp').post(verifyOTP);

module.exports = router;