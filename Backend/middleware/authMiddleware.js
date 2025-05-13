const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Récupère le token ('Bearer TOKEN')
            token = req.headers.authorization.split(' ')[1];

            // Vérifie le token
            const decoded = jwt.verify(token, config.jwtSecret);

            // Récupère l'utilisateur depuis le token (sans le mot de passe) et l'attache à la requête
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                 return res.status(401).json({ message: 'Utilisateur non trouvé pour ce token' });
            }

            next(); // Passe au middleware suivant ou au contrôleur
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Non autorisé, pas de token fourni' });
    }
};

module.exports = { protect };