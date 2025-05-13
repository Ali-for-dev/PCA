import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// allowedRoles est un tableau optionnel de rôles autorisés (ex: ['admin', 'professeur'])
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation(); // Pour rediriger l'utilisateur où il voulait aller

  // Si toujours en train de charger les infos user, ne rien rendre ou afficher un loader
  if (loading) {
    return <div>Checking authentication...</div>; // Ou un spinner
  }

  // 1. Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion, en gardant l'URL d'origine
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Vérifier si des rôles spécifiques sont requis et si l'utilisateur les a
  //    (allowedRoles est un tableau comme ['admin'] ou ['professeur', 'admin'])
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    console.warn(
      `Access denied for role: ${user?.role}. Required: ${allowedRoles.join(
        " or "
      )}`
    );
    // L'utilisateur est connecté mais n'a pas le bon rôle
    // Rediriger vers une page "Non Autorisé" ou le tableau de bord
    return <Navigate to="/unauthorized" replace />; // Ou vers /dashboard avec un message?
  }

  // 3. Si authentifié et (pas de rôle requis OU rôle autorisé), afficher le contenu de la route
  return <Outlet />; // Rend le composant enfant de la route (ex: <DashboardPage />)
};

export default ProtectedRoute;
