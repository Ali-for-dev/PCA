const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Fonction pour générer un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    });
};

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body; // Le rôle peut être optionnel ou forcé selon la logique

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
        }

        // Crée l'utilisateur (le hashage se fait via le middleware Mongoose)
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'etudiant', // Définit 'etudiant' par défaut si non fourni
        });

        if (user) {
            // Ne renvoie pas le mot de passe
            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                ...userResponse,
                token: generateToken(user._id), // Envoie aussi un token à l'inscription
            });
        } else {
            res.status(400).json({ message: 'Données utilisateur invalides' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: error.message });
    }
};

// @desc    Authentifier un utilisateur et obtenir un token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
         return res.status(400).json({ message: 'Veuillez fournir email et mot de passe' });
    }

    try {
        // Trouve l'utilisateur par email et inclut le mot de passe pour la comparaison
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Ne renvoie pas le mot de passe
            const userResponse = user.toObject();
            delete userResponse.password;

            res.json({
               ...userResponse,
               token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la connexion', error: error.message });
    }
};

 // @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private (nécessite token)
exports.getMe = async (req, res) => {
    // req.user est défini par le middleware 'protect'
    if (req.user) {
         // Le mot de passe a déjà été retiré par .select('-password') dans le middleware
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
};