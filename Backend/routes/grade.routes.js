const express = require('express');
const {
    assignOrUpdateGrade,
    getGradesByStudent,
    getGradesByCourse,
    deleteGrade
} = require('../controllers/grade.controller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizeMiddleware');

const router = express.Router();

// Toutes les routes de notes nécessitent une connexion
router.use(protect);

// Assigner/MAJ une note - Autorisation vérifiée dans le contrôleur (Admin ou Prof du cours)
router.post('/', authorize('admin', 'professeur'), assignOrUpdateGrade);

// Voir les notes par étudiant - Autorisation vérifiée dans le contrôleur (Admin ou étudiant concerné)
router.get('/student/:studentId', authorize('admin', 'professeur', 'etudiant'), getGradesByStudent);

// Voir les notes par cours - Autorisation vérifiée dans le contrôleur (Admin, Prof du cours, ou étudiant inscrit pour sa propre note)
router.get('/course/:courseId', authorize('admin', 'professeur', 'etudiant'), getGradesByCourse);

// Supprimer une note - Autorisation vérifiée dans le contrôleur (Admin ou Prof du cours)
router.delete('/:gradeId', authorize('admin', 'professeur'), deleteGrade);


module.exports = router;