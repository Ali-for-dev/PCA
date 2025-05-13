const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Assigner/Mettre à jour une note pour un étudiant dans un cours
// @route   POST /api/grades
// @access  Private (Professeur propriétaire du cours, Admin)
exports.assignOrUpdateGrade = async (req, res) => {
    const { studentId, courseId, gradeValue } = req.body;

    if (!studentId || !courseId || !gradeValue) {
         return res.status(400).json({ message: 'Veuillez fournir studentId, courseId et gradeValue.' });
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé.' });
        }

        const student = await User.findById(studentId);
         if (!student || student.role !== 'etudiant') {
             return res.status(404).json({ message: 'Étudiant non trouvé ou ID invalide.' });
        }

        // Vérification DAC: Seul l'admin ou le professeur du cours peut assigner une note
        const isCourseProfessor = course.professor.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && !isCourseProfessor) {
            return res.status(403).json({ message: 'Action non autorisée. Vous n\'êtes pas le professeur de ce cours.' });
        }

        // Vérifier si l'étudiant est bien inscrit au cours
        const isEnrolled = course.studentsEnrolled.some(id => id.equals(studentId));
         if (!isEnrolled) {
              return res.status(400).json({ message: 'Cet étudiant n\'est pas inscrit à ce cours.' });
         }


        // Cherche une note existante pour cet étudiant dans ce cours
        let grade = await Grade.findOne({ student: studentId, course: courseId });

        if (grade) {
            // Mettre à jour la note existante
            grade.gradeValue = gradeValue;
            grade.assignedBy = req.user._id; // Qui a fait la dernière modification
            grade.assignedAt = Date.now();
        } else {
            // Créer une nouvelle note
            grade = new Grade({
                student: studentId,
                course: courseId,
                gradeValue: gradeValue,
                assignedBy: req.user._id,
            });
        }

        const savedGrade = await grade.save();
        // Populer pour renvoyer des informations utiles
         const populatedGrade = await Grade.findById(savedGrade._id)
                                        .populate('student', 'name email')
                                        .populate('course', 'title code')
                                        .populate('assignedBy', 'name');

        res.status(grade ? 200 : 201).json(populatedGrade);

    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID invalide pour cours ou étudiant.' });
         }
        res.status(500).json({ message: 'Erreur serveur lors de l\'assignation de la note', error: error.message });
    }
};

// @desc    Récupérer les notes d'un étudiant spécifique (pour tous ses cours)
// @route   GET /api/grades/student/:studentId
// @access  Private (Admin, Professeur, Étudiant concerné)
exports.getGradesByStudent = async (req, res) => {
    const targetStudentId = req.params.studentId;

    try {
         // Vérification DAC:
         const isAdmin = req.user.role === 'admin';
         const isProfessor = req.user.role === 'professeur'; // Un prof peut voir les notes des étudiants de SES cours, mais ici on demande TOUTES les notes. On restreint.
         const isTargetStudent = req.user.id === targetStudentId && req.user.role === 'etudiant';

         // Seul l'admin ou l'étudiant lui-même peut voir TOUTES ses notes.
         // Un professeur pourrait voir les notes qu'IL a assignées, mais pas toutes.
         if (!isAdmin && !isTargetStudent) {
              // Si c'est un professeur, on pourrait envisager une logique plus complexe
              // pour ne retourner que les notes des cours qu'il enseigne, mais la route est "notes par étudiant"
             return res.status(403).json({ message: 'Action non autorisée pour voir toutes les notes de cet étudiant.' });
         }

         // Vérifier si l'étudiant existe
         const student = await User.findById(targetStudentId);
         if (!student || student.role !== 'etudiant') {
              return res.status(404).json({ message: 'Étudiant non trouvé.' });
         }

        const grades = await Grade.find({ student: targetStudentId })
                                 .populate('course', 'title code')
                                 .populate('assignedBy', 'name'); // Voir qui a donné la note

        res.json(grades);

    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID étudiant invalide.' });
         }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Récupérer toutes les notes pour un cours spécifique
// @route   GET /api/grades/course/:courseId
// @access  Private (Admin, Professeur du cours, Étudiants inscrits au cours)
exports.getGradesByCourse = async (req, res) => {
    const targetCourseId = req.params.courseId;

    try {
        const course = await Course.findById(targetCourseId);
        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé.' });
        }

        // Vérification DAC:
        const isAdmin = req.user.role === 'admin';
        const isCourseProfessor = course.professor.toString() === req.user.id;
         // Est-ce que l'étudiant connecté est inscrit à CE cours ?
        const isEnrolledStudent = req.user.role === 'etudiant' && course.studentsEnrolled.some(id => id.equals(req.user._id));


        if (!isAdmin && !isCourseProfessor && !isEnrolledStudent) {
            return res.status(403).json({ message: 'Action non autorisée pour voir les notes de ce cours.' });
        }

        let gradesQuery = Grade.find({ course: targetCourseId })
                                .populate('student', 'name email') // Voir quel étudiant
                                .populate('assignedBy', 'name');    // Voir qui a assigné

        // DAC - Raffinement: Si c'est un étudiant, il ne voit que sa propre note pour ce cours
        if (isEnrolledStudent && !isAdmin && !isCourseProfessor) {
            gradesQuery = gradesQuery.where('student').equals(req.user._id);
        }

        const grades = await gradesQuery.exec(); // Exécute la requête Mongoose

        res.json(grades);

    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID cours invalide.' });
         }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

 // @desc    Supprimer une note spécifique
// @route   DELETE /api/grades/:gradeId
// @access  Private (Admin, Professeur qui a assigné la note ou prof du cours?) - Décision à prendre
exports.deleteGrade = async (req, res) => {
    const gradeId = req.params.gradeId;

     try {
         const grade = await Grade.findById(gradeId).populate('course'); // Populer pour vérifier le prof du cours

         if (!grade) {
             return res.status(404).json({ message: 'Note non trouvée.' });
         }
         if (!grade.course) {
              // Cas étrange où le cours associé n'existe plus mais la note oui
              return res.status(404).json({ message: 'Cours associé à cette note introuvable.' });
         }

         // Vérification DAC: Admin ou Professeur du cours peuvent supprimer
         const isAdmin = req.user.role === 'admin';
         const isCourseProfessor = grade.course.professor.toString() === req.user.id;
         // Alternative: seul celui qui a assigné peut supprimer? const isAssigner = grade.assignedBy.toString() === req.user.id;

         if (!isAdmin && !isCourseProfessor) {
              return res.status(403).json({ message: 'Action non autorisée pour supprimer cette note.' });
         }

         await grade.deleteOne(); // Ou grade.remove()

         res.json({ message: 'Note supprimée avec succès.' });

     } catch (error) {
          if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de note invalide.' });
         }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
     }
};