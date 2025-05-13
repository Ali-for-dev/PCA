import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="font-bold text-xl"
            >
              ScolaritéApp
            </Link>
            {/* Liens conditionnels basés sur l'authentification et le rôle */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      className="hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      to="/courses"
                      className="hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Cours
                    </Link>

                    {/* Liens spécifiques au rôle */}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/users"
                        className="hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Gérer Utilisateurs
                      </Link>
                    )}
                    {user?.role === "professeur" && (
                      <Link
                        to="/professor/my-courses"
                        className="hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Mes Cours
                      </Link>
                    )}
                    {user?.role === "etudiant" && (
                      <Link
                        to="/student/my-grades"
                        className="hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Mes Notes
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center md:ml-6">
                <span className="mr-3">
                  Bonjour, {user?.name} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/login"
                  className="hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
          {/* Ajouter un bouton burger pour le mobile si nécessaire */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
