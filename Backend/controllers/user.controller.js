const User = require('../models/User');

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}); // Exclut le mot de passe par défaut grâce au modèle
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private (Admin)
 exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID utilisateur invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Mettre à jour un utilisateur (ex: changer rôle)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
   const { name, email, role } = req.body; // Ne pas permettre la maj du mot de passe ici
   const updateData = { name, email, role };
   // Filtrer les champs undefined pour ne pas écraser avec null
   Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    try {
        const user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true, // Retourne le document mis à jour
            runValidators: true, // Exécute les validateurs du schéma
        });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
         if (error.code === 11000) { // Erreur de duplicité (email)
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
         }
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID utilisateur invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
     try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        // TODO: Gérer les conséquences (ex: désinscrire des cours, supprimer notes ?)
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID utilisateur invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};