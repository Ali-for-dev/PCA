const express = require('express');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./config/db');

// Importer les routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const gradeRoutes = require('./routes/grade.routes');

// Connexion à la base de données
connectDB();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware CORS (permet les requêtes depuis votre frontend React)
// Configurez-le de manière plus restrictive en production
app.use(cors()); // Pour le développement, accepte toutes les origines

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);

// Route de test simple
app.get('/', (req, res) => {
    res.send('API Scolarité MERN - Backend Fonctionnel!');
});

// Gestionnaire d'erreurs simple (à améliorer pour la production)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Quelque chose s\'est mal passé!');
});


const PORT = config.port;

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));