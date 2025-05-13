const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/authMiddleware'); // Middleware d'authentification

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); // Protégée: nécessite un token valide

module.exports = router;