const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
    student: { // L'étudiant qui a reçu la note
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: { // Le cours concerné
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    gradeValue: { // La note elle-même (ex: 'A', 18, 'Pass')
        type: String, // Ou Number, selon votre système de notation
        required: true,
    },
    assignedBy: { // Qui a donné la note (probablement le professeur)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedAt: { type: Date, default: Date.now },
});

// Index pour des recherches efficaces
GradeSchema.index({ student: 1, course: 1 }, { unique: true }); // Un étudiant a une seule note par cours

module.exports = mongoose.model('Grade', GradeSchema);