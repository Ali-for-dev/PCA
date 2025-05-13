const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // select: false pour ne pas renvoyer le mdp par défaut
    role: {
        type: String,
        enum: ['admin', 'professeur', 'etudiant'], // Rôles définis
        default: 'etudiant',
        required: true,
    },
    // Ajoutez d'autres champs si nécessaire (ex: numéro étudiant, département prof)
    createdAt: { type: Date, default: Date.now },
});

// Middleware Mongoose pour hasher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Méthode pour comparer les mots de passe (pour la connexion)
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);