// Middleware pour vérifier si le rôle de l'utilisateur est autorisé
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Vérifie si req.user a été défini par le middleware d'authentification
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "Accès refusé. Rôle utilisateur non défini." });
        }

        // Vérifie si le rôle de l'utilisateur est dans la liste des rôles autorisés
        if (!allowedRoles.includes(req.user.role)) {
             // Log pour débogage
            console.log(`Accès refusé pour rôle: ${req.user.role}. Rôles autorisés: ${allowedRoles.join(', ')}`);
            return res.status(403).json({ message: `Accès refusé. Rôle '${req.user.role}' non autorisé pour cette ressource.` });
        }

        next(); // L'utilisateur a le bon rôle, on continue
    };
};

module.exports = { authorize };