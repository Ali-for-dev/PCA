import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../api/services";
import { useNavigate } from "react-router-dom"; // Pour la redirection après login/logout

// 1. Créer le contexte
const AuthContext = createContext();

// 2. Créer le Provider (composant qui enveloppera l'application)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stocke les infos utilisateur { _id, name, email, role }
  const [token, setToken] = useState(localStorage.getItem("authToken")); // Récupère le token au démarrage
  const [loading, setLoading] = useState(true); // Pour savoir si on charge les infos user au début
  const navigate = useNavigate();

  // Effet pour charger les infos utilisateur si un token existe au montage
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Option 1: Stocker/Récupérer user depuis localStorage (plus rapide mais moins sécurisé si infos sensibles)
          // const storedUser = localStorage.getItem('user');
          // if (storedUser) {
          //   setUser(JSON.parse(storedUser));
          // } else { ... }

          // Option 2: Toujours vérifier le token avec l'API (plus sûr)
          const response = await authService.getMe(); // Appelle /api/auth/me
          setUser(response.data);
          // Optionnel: stocker user dans localStorage si vous voulez éviter l'appel API à chaque rechargement
          // localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Failed to fetch user:", error);
          // Le token est probablement invalide/expiré
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          // Pas besoin de rediriger ici, l'intercepteur Axios le fait déjà
        }
      }
      setLoading(false); // Fin du chargement initial
    };

    fetchUser();
  }, [token]); // Se redéclenche si le token change

  // Fonction de connexion
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const { token: receivedToken, ...userData } = response.data;

      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem("authToken", receivedToken); // Stocke le token
      localStorage.setItem("user", JSON.stringify(userData)); // Stocke les infos user
      setLoading(false);
      navigate("/dashboard"); // Redirige vers le tableau de bord après connexion
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      setLoading(false);
      // Gérer l'affichage de l'erreur dans le composant LoginPage
      throw error; // Renvoyer l'erreur pour la gestion locale
    }
  };

  // Fonction d'inscription (similaire à login)
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      const { token: receivedToken, ...newUserData } = response.data;

      setToken(receivedToken);
      setUser(newUserData);
      localStorage.setItem("authToken", receivedToken);
      localStorage.setItem("user", JSON.stringify(newUserData));
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data?.message || error.message
      );
      setLoading(false);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/login"); // Redirige vers la page de connexion
  };

  // Valeur fournie par le contexte
  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user, // True si token et user existent
    loading, // Pour afficher un indicateur de chargement global si besoin
    login,
    register,
    logout,
  };

  // Rendre le Provider avec les enfants
  // On n'affiche rien tant que le chargement initial n'est pas terminé
  // (pour éviter des flashs d'interface non authentifiée)
  return (
    <AuthContext.Provider value={value}>
      {
        !loading ? (
          children
        ) : (
          <div>Loading Application...</div>
        ) /* Ou un spinner */
      }
    </AuthContext.Provider>
  );
};

// 3. Créer un hook personnalisé pour utiliser le contexte facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
