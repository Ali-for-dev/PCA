import axios from 'axios';

// Crée une instance Axios avec l'URL de base de l'API
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Utilise la variable d'environnement
});

// Intercepteur pour ajouter le token JWT à chaque requête sortante
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupère le token depuis le localStorage (ou sessionStorage)
    const token = localStorage.getItem('authToken');
    if (token) {
      // Ajoute l'en-tête d'autorisation
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optionnel : Intercepteur de réponse pour gérer les erreurs globales (ex: 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response, // Si succès, retourne la réponse
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si 401 (non autorisé), le token est invalide ou expiré
      console.error("Unauthorized access - 401. Clearing token and redirecting.");
      // Supprime le token invalide
      localStorage.removeItem('authToken');
      localStorage.removeItem('user'); // Supprimer aussi les infos utilisateur si stockées
      // Redirige vers la page de connexion
      // Utiliser window.location ou mieux, une fonction de logout du contexte d'authentification
      if (window.location.pathname !== '/login') {
         window.location.href = '/login'; // Redirection simple, mieux avec useNavigate si possible dans un composant
      }
    }
    return Promise.reject(error); // Rejette l'erreur pour la gestion locale
  }
);


export default axiosInstance;