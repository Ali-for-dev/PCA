import React from "react";
import { Link, useLocation } from "react-router-dom";
// Vous pouvez importer useAuth pour vérifier si l'utilisateur est connecté et adapter les liens
// import { useAuth } from '../contexts/AuthContext';

const NotFoundPage = () => {
  const location = useLocation();
  // const { user } = useAuth(); // Décommentez si vous voulez conditionner les liens

  // Définissez les liens pertinents en fonction de votre AppRouter.jsx
  // Adaptez ces liens et leurs conditions d'affichage si nécessaire
  const commonLinks = [
    { path: "/dashboard", label: "Tableau de bord" },
    { path: "/courses", label: "Liste des Cours" },
  ];

  const publicLinks = [
    { path: "/login", label: "Se connecter" },
    { path: "/register", label: "S'inscrire" },
  ];

  // Exemple de liens spécifiques au rôle (à adapter si vous utilisez useAuth)
  // const adminLinks = [ { path: '/admin/users', label: 'Gérer les utilisateurs' } ];
  // const professorLinks = [ { path: '/professor/my-courses', label: 'Mes Cours (Professeur)' } ];
  // const studentLinks = [
  //   { path: '/student/my-grades', label: 'Mes Notes (Étudiant)' },
  //   { path: '/student/available-courses', label: 'Cours Disponibles (Étudiant)' }
  // ];

  // Pour l'instant, affichons des liens génériques.
  // Si vous implémentez la logique useAuth, vous pourrez affiner cela.
  let suggestedLinks = [];
  // if (user) { // Si l'utilisateur est connecté
  //   suggestedLinks.push(...commonLinks);
  //   if (user.role === 'admin') suggestedLinks.push(...adminLinks);
  //   if (user.role === 'professeur') suggestedLinks.push(...professorLinks);
  //   if (user.role === 'etudiant') suggestedLinks.push(...studentLinks);
  // } else { // Si l'utilisateur n'est pas connecté
  suggestedLinks.push(...publicLinks);
  suggestedLinks.push({
    path: "/dashboard",
    label: "Tableau de bord (si connecté)",
  }); // Suggestion
  // }
  // Filtrer pour éviter les doublons et le lien actuel si c'est / (racine)
  suggestedLinks = suggestedLinks.filter(
    (link, index, self) =>
      index === self.findIndex((t) => t.path === link.path) &&
      link.path !== location.pathname
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <div className="bg-white p-10 md:p-16 rounded-lg shadow-xl">
        <h1 className="text-6xl md:text-9xl font-bold text-indigo-600">404</h1>
        <h2 className="mt-4 text-2xl md:text-4xl font-semibold text-gray-800">
          Page non trouvée
        </h2>
        <p className="mt-3 text-gray-600">
          Désolé, la page que vous recherchez (`{location.pathname}`) n'existe
          pas ou a été déplacée.
        </p>
        <div className="mt-8">
          <p className="text-gray-700 mb-4">Voici quelques liens utiles :</p>
          <ul className="space-y-2">
            {suggestedLinks.length > 0 ? (
              suggestedLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                <Link
                  to="/"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                >
                  Retour à l'accueil
                </Link>
              </li>
            )}
            {/* Fallback si suggestedLinks est vide, pour toujours avoir au moins un lien */}
            {suggestedLinks.length === 0 && location.pathname !== "/" && (
              <li>
                <Link
                  to="/"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                >
                  Retour à l'accueil
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="mt-10">
          <Link
            to={-1} // Tente de retourner à la page précédente
            className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retour en arrière
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
