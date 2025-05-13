const dotenv = require('dotenv');
dotenv.config(); // Charge les variables depuis .env

module.exports = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
};