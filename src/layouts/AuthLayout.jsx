// src/layouts/AuthLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom"; // Outlet pour rendre les composants enfants (LoginPage, RegisterPage)

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 sm:px-6 lg:px-8">
      {/* Conteneur pour le logo/titre et le contenu du formulaire */}
      <div className="w-full max-w-md space-y-8">
        {/* Logo ou titre de l'application (optionnel) */}
        <div className="text-center">
          <Link to="/">
            {" "}
            {/* Lien vers la page d'accueil si l'utilisateur n'est pas connecté */}
            {/* Vous pouvez remplacer ceci par une image SVG ou un composant Logo */}
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Scolarité<span className="text-blue-300">App</span>
            </h1>
          </Link>
          <p className="mt-2 text-center text-sm text-blue-200">
            Gérez votre parcours académique en toute simplicité.
          </p>
        </div>

        {/* Le contenu spécifique à la page (LoginPage ou RegisterPage) sera injecté ici */}
        <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8">
          <Outlet />
        </div>

        {/* Pied de page minimal pour le layout d'authentification (optionnel) */}
        <p className="mt-8 text-center text-xs text-blue-300">
          &copy; {new Date().getFullYear()} ScolaritéApp. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
