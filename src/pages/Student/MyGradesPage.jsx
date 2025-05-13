import React, { useState, useEffect } from "react";
import { gradeService } from "../../api/services"; // Assurez-vous que le chemin est correct
import { useAuth } from "../../contexts/AuthContext"; // MODIFIÉ: Utilisation du hook useAuth
import { Link } from "react-router-dom";

// Icône simple pour le chargement (vous pouvez utiliser une bibliothèque d'icônes comme react-icons)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

const MyGradesPage = () => {
  // MODIFIÉ: Utilisation de useAuth() pour obtenir le contexte
  const { user, loading: authLoading } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true); // État de chargement pour les notes elles-mêmes
  const [error, setError] = useState("");

  useEffect(() => {
    // Ne pas charger les données si l'authentification est en cours ou si l'utilisateur n'est pas connecté
    if (authLoading) {
      // Si authLoading est true, on attend qu'il devienne false.
      // setLoading(true) ici pourrait être redondant si authLoading gère déjà un spinner global.
      return;
    }

    if (!user) {
      setError("Veuillez vous connecter pour voir vos notes.");
      setLoading(false); // Fin du chargement local car pas d'utilisateur
      return;
    }

    // Vérifier si l'utilisateur a le rôle 'etudiant'
    if (user.role !== "etudiant") {
      setError("Cette page est réservée aux étudiants.");
      setLoading(false); // Fin du chargement local
      return;
    }

    const fetchGrades = async () => {
      setLoading(true); // Début du chargement des notes
      setError("");
      try {
        // Utilise l'ID de l'utilisateur connecté pour récupérer ses notes
        // Assurez-vous que user._id existe et est correct.
        if (!user._id) {
          setError("Impossible de récupérer l'identifiant de l'utilisateur.");
          setLoading(false);
          return;
        }
        const response = await gradeService.getGradesByStudent(user._id);
        setGrades(response.data || []); // Assurez-vous que response.data est un tableau
      } catch (err) {
        console.error("Erreur lors de la récupération des notes:", err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.message === "Network Error") {
          setError("Erreur de réseau. Impossible de joindre le serveur.");
        } else {
          setError(
            "Une erreur est survenue lors de la récupération de vos notes."
          );
        }
      } finally {
        setLoading(false); // Fin du chargement des notes
      }
    };

    fetchGrades();
  }, [user, authLoading]); // Se déclenche si user ou authLoading change

  // Affichage pendant le chargement initial de l'authentification (géré par AuthProvider)
  // ou le chargement des notes
  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  // Si l'utilisateur n'est pas connecté après la fin du chargement de l'auth
  // (Ce cas devrait être couvert par le return précédent si authLoading est bien géré,
  // mais une double vérification peut être utile)
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center font-inter">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes Notes</h1>
          <p className="text-red-500">
            {error || "Veuillez vous connecter pour accéder à cette page."}
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas un étudiant
  if (user.role !== "etudiant") {
    return (
      <div className="container mx-auto px-4 py-8 text-center font-inter">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Accès Refusé
          </h1>
          <p className="text-red-500">
            {error || "Cette page est réservée aux étudiants."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
          Mes Notes
        </h1>

        {/* Affichage du message d'erreur spécifique au chargement des notes */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md"
            role="alert"
          >
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
        )}

        {/* Tableau des notes */}
        {!error && grades.length === 0 && (
          <div className="text-center text-gray-600 py-10">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Aucune note trouvée
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Vous n'avez pas encore de notes enregistrées.
            </p>
          </div>
        )}

        {!error && grades.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cours (Titre)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code Cours
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Note
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Attribuée par
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date d'attribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade) => (
                  <tr
                    key={grade._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.course?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.course?.code || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                          ${
                            parseFloat(grade.gradeValue) >= 10
                              ? "bg-green-100 text-green-800"
                              : parseFloat(grade.gradeValue) >= 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {grade.gradeValue}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.assignedBy?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.assignedAt
                        ? new Date(grade.assignedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGradesPage;
