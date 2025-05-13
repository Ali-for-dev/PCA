const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    professor: { // Référence au professeur responsable
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // On pourrait ajouter une validation pour s'assurer que c'est bien un 'professeur'
    },
    studentsEnrolled: [{ // Liste des étudiants inscrits
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', CourseSchema);