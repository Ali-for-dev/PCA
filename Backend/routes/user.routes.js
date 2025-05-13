const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizeMiddleware'); // Middleware d'autorisation

const router = express.Router();

// Appliquer protect (authentification) et authorize (rôle admin) à toutes les routes de ce fichier
router.use(protect);
router.use(authorize('admin')); // Seul l'admin peut gérer les utilisateurs

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;