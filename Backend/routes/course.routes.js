const express = require('express');
const {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    enrollCourse,
    unenrollCourse
 } = require('../controllers/course.controller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizeMiddleware');

const router = express.Router();

// Routes publiques ou nécessitant juste une connexion
router.get('/', protect, getAllCourses); // Tout utilisateur connecté peut voir les cours
router.get('/:id', protect, getCourseById); // Tout utilisateur connecté peut voir un cours spécifique

// Routes avec autorisations spécifiques
router.post('/', protect, authorize('admin', 'professeur'), createCourse); // Admin ou Prof peut créer
router.put('/:id', protect, authorize('admin', 'professeur'), updateCourse); // Admin ou Prof (propriétaire) peut MAJ (vérif dans le contrôleur)
router.delete('/:id', protect, authorize('admin', 'professeur'), deleteCourse); // Admin ou Prof (propriétaire) peut Suppr (vérif dans le contrôleur)

// Routes pour les étudiants
router.post('/:id/enroll', protect, authorize('etudiant'), enrollCourse); // Etudiant s'inscrit
router.delete('/:id/unenroll', protect, authorize('etudiant'), unenrollCourse); // Etudiant se désinscrit

module.exports = router;