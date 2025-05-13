const Course = require('../models/Course');
const User = require('../models/User'); // Pour vérifier le rôle professeur

// @desc    Créer un nouveau cours
// @route   POST /api/courses
// @access  Private (Admin, Professeur)
exports.createCourse = async (req, res) => {
    const { title, code, description, professorId } = req.body;

    try {
        // Vérification que l'ID fourni correspond bien à un professeur
        const professor = await User.findById(professorId);
        if (!professor || professor.role !== 'professeur') {
            // Si l'utilisateur connecté est un professeur, il ne peut créer que pour lui-même
            if (req.user.role === 'professeur' && req.user.id !== professorId) {
                 return res.status(403).json({ message: 'Un professeur ne peut créer des cours que pour lui-même.' });
            }
             // Si c'est un admin ou si l'ID ne correspond pas à un prof
             if (!professor || professor.role !== 'professeur') {
                 return res.status(400).json({ message: 'L\'ID fourni ne correspond pas à un utilisateur avec le rôle professeur.' });
             }
        }

        // L'utilisateur connecté doit être soit admin, soit le professeur désigné
        if (req.user.role !== 'admin' && req.user.id !== professorId) {
             return res.status(403).json({ message: 'Action non autorisée.' });
        }


        const newCourse = new Course({
            title,
            code,
            description,
            professor: professorId,
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);

    } catch (error) {
        if (error.code === 11000) { // Erreur de duplicité (code de cours)
            return res.status(400).json({ message: 'Ce code de cours est déjà utilisé.' });
         }
        res.status(500).json({ message: 'Erreur serveur lors de la création du cours', error: error.message });
    }
};

// @desc    Récupérer tous les cours
// @route   GET /api/courses
// @access  Private (Tous les rôles connectés)
exports.getAllCourses = async (req, res) => {
    try {
        // Populer le nom du professeur au lieu de juste l'ID
        const courses = await Course.find().populate('professor', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Récupérer un cours par ID
// @route   GET /api/courses/:id
// @access  Private (Tous les rôles connectés)
exports.getCourseById = async (req, res) => {
     try {
        // Populer aussi les étudiants inscrits (juste le nom et email par exemple)
        const course = await Course.findById(req.params.id)
                                   .populate('professor', 'name email')
                                   .populate('studentsEnrolled', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé' });
        }
        res.json(course);
    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de cours invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Mettre à jour un cours
// @route   PUT /api/courses/:id
// @access  Private (Admin, Professeur propriétaire du cours)
exports.updateCourse = async (req, res) => {
    const { title, code, description } = req.body;
    const updateData = { title, code, description };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);


    try {
         const course = await Course.findById(req.params.id);

         if (!course) {
             return res.status(404).json({ message: 'Cours non trouvé' });
         }

         // Vérification DAC: Seul l'admin ou le professeur propriétaire peut modifier
         const isOwner = course.professor.toString() === req.user.id;
         const isAdmin = req.user.role === 'admin';

         if (!isAdmin && !isOwner) {
             return res.status(403).json({ message: 'Action non autorisée. Vous n\'êtes pas le professeur de ce cours.' });
         }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
                                         .populate('professor', 'name email'); // Renvoyer avec le prof populé

        res.json(updatedCourse);
    } catch (error) {
         if (error.code === 11000) {
            return res.status(400).json({ message: 'Ce code de cours est déjà utilisé par un autre cours.' });
         }
          if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de cours invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour', error: error.message });
    }
};

// @desc    Supprimer un cours
// @route   DELETE /api/courses/:id
// @access  Private (Admin, Professeur propriétaire du cours)
 exports.deleteCourse = async (req, res) => {
     try {
         const course = await Course.findById(req.params.id);

         if (!course) {
             return res.status(404).json({ message: 'Cours non trouvé' });
         }

         // Vérification DAC: Seul l'admin ou le professeur propriétaire peut supprimer
         const isOwner = course.professor.toString() === req.user.id;
         const isAdmin = req.user.role === 'admin';

         if (!isAdmin && !isOwner) {
             return res.status(403).json({ message: 'Action non autorisée.' });
         }

         // TODO: Gérer les conséquences : supprimer les notes associées ? Désinscrire les étudiants ?
         await course.deleteOne(); // Utilisez deleteOne() ou remove() selon la version de Mongoose

        res.json({ message: 'Cours supprimé avec succès' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de cours invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur lors de la suppression', error: error.message });
    }
};


// @desc    Inscrire l'étudiant connecté à un cours
// @route   POST /api/courses/:id/enroll
// @access  Private (Etudiant)
exports.enrollCourse = async (req, res) => {
    // Seul un étudiant peut s'inscrire lui-même
    if (req.user.role !== 'etudiant') {
         return res.status(403).json({ message: 'Seuls les étudiants peuvent s\'inscrire aux cours.' });
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé' });
        }

        // Vérifier si l'étudiant est déjà inscrit
        const isAlreadyEnrolled = course.studentsEnrolled.some(studentId => studentId.equals(req.user._id));
        if (isAlreadyEnrolled) {
            return res.status(400).json({ message: 'Vous êtes déjà inscrit à ce cours.' });
        }

        course.studentsEnrolled.push(req.user._id);
        await course.save();

         // Renvoyer le cours mis à jour avec les étudiants populés
         const updatedCourse = await Course.findById(req.params.id)
                                        .populate('professor', 'name email')
                                        .populate('studentsEnrolled', 'name email');

        res.json({ message: 'Inscription réussie.', course: updatedCourse });

    } catch (error) {
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de cours invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: error.message });
    }
};

 // @desc    Désinscrire l'étudiant connecté d'un cours
// @route   DELETE /api/courses/:id/unenroll
// @access  Private (Etudiant)
exports.unenrollCourse = async (req, res) => {
     if (req.user.role !== 'etudiant') {
         return res.status(403).json({ message: 'Seuls les étudiants peuvent se désinscrire.' });
    }
     try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Cours non trouvé' });
        }

        // Vérifier si l'étudiant est bien inscrit
        const initialLength = course.studentsEnrolled.length;
        course.studentsEnrolled = course.studentsEnrolled.filter(studentId => !studentId.equals(req.user._id));

        if (course.studentsEnrolled.length === initialLength) {
             return res.status(400).json({ message: 'Vous n\'êtes pas inscrit à ce cours.' });
        }

        await course.save();

         const updatedCourse = await Course.findById(req.params.id)
                                        .populate('professor', 'name email')
                                        .populate('studentsEnrolled', 'name email');

        res.json({ message: 'Désinscription réussie.', course: updatedCourse });

    } catch (error) {
         if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de cours invalide' });
         }
        res.status(500).json({ message: 'Erreur serveur lors de la désinscription', error: error.message });
    }
};