// src/pages/Student/AvailableCoursesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"; // Pour le lien vers les détails du cours
import { courseService } from "../../api/services";
import { useAuth } from "../../contexts/AuthContext";

// On réutilise le même composant CourseCard que dans CourseListPage
// Si vous ne l'avez pas extrait, vous pouvez le copier ici ou l'importer s'il est dans un fichier séparé.
// Pour cet exemple, je suppose qu'il est accessible ou que vous copiez sa définition.

const CourseCard = ({
  course,
  currentUser,
  onEnroll,
  onUnenroll,
  isEnrolled,
}) => {
  // (Copiez la définition de CourseCard de CourseListPage.jsx ici si elle n'est pas importée globalement)
  // Exemple abrégé, assurez-vous d'avoir la version complète :
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">
          {course.title}
        </h2>
        <p className="text-sm text-gray-500 mb-1 font-semibold">
          Code: {course.code}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          Professeur:{" "}
          <span className="font-medium">
            {course.professor?.name || "Non assigné"}
          </span>
        </p>
        <p className="text-gray-700 mb-4 h-20 overflow-y-auto text-sm">
          {course.description || "Aucune description disponible."}
        </p>
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Link
            to={`/courses/${course._id}`} // Lien vers la page de détail du cours
            className="w-full sm:w-auto text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
          >
            Voir Détails
          </Link>
          {/* Les boutons s'affichent uniquement pour les étudiants */}
          {currentUser?.role === "etudiant" && (
            <>
              {isEnrolled ? (
                <button
                  onClick={() => onUnenroll(course._id)}
                  className="w-full sm:w-auto text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
                >
                  Se désinscrire
                </button>
              ) : (
                <button
                  onClick={() => onEnroll(course._id)}
                  className="w-full sm:w-auto text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
                >
                  S'inscrire
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AvailableCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth(); // L'utilisateur connecté (devrait être un étudiant ici)

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data || []);
    } catch (err) {
      setError(
        "Impossible de charger la liste des cours disponibles. Veuillez réessayer."
      );
      console.error(
        "Erreur fetchCourses (AvailableCoursesPage):",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // S'assurer que l'utilisateur est bien un étudiant avant de charger
    if (user?.role === "etudiant") {
      fetchCourses();
    } else if (user && user.role !== "etudiant") {
      // Rediriger ou afficher un message si un non-étudiant accède à cette page
      // Normalement, ProtectedRoute devrait gérer cela, mais c'est une double vérification.
      setError("Cette page est réservée aux étudiants.");
      setLoading(false);
    }
    // Si !user, ProtectedRoute gère déjà la redirection vers /login.
  }, [fetchCourses, user]);

  const handleEnroll = async (courseId) => {
    // La vérification user.role === 'etudiant' est déjà faite dans le useEffect et par le routing
    try {
      await courseService.enrollCourse(courseId);
      // Mettre à jour l'état local pour refléter l'inscription
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? {
                ...course,
                studentsEnrolled: [
                  ...(course.studentsEnrolled || []),
                  user._id,
                ],
              }
            : course
        )
      );
      alert("Inscription réussie !");
    } catch (err) {
      alert(
        `Erreur lors de l'inscription: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await courseService.unenrollCourse(courseId);
      // Mettre à jour l'état local
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? {
                ...course,
                studentsEnrolled: (course.studentsEnrolled || []).filter(
                  (studentId) => studentId !== user._id
                ),
              }
            : course
        )
      );
      alert("Désinscription réussie !");
    } catch (err) {
      alert(
        `Erreur lors de la désinscription: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-gray-700">
          Chargement des cours disponibles...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 text-lg bg-red-100 p-4 rounded-md">
          {error}
        </p>
        {/* Optionnel: bouton pour réessayer si l'erreur n'est pas une erreur de permission */}
        {error.includes("Impossible de charger") && (
          <button
            onClick={fetchCourses}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  // Si l'utilisateur n'est pas un étudiant (ce cas devrait être géré par le routing, mais au cas où)
  if (user?.role !== "etudiant") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-orange-600 text-lg bg-orange-100 p-4 rounded-md">
          Accès non autorisé à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Cours Disponibles pour Inscription
        </h1>
        <p className="mt-2 text-md text-gray-600">
          Parcourez les cours ci-dessous et inscrivez-vous à ceux qui vous
          intéressent.
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {courses.map((course) => {
            // Vérifie si l'étudiant actuel est inscrit à ce cours
            const isEnrolled = (course.studentsEnrolled || []).includes(
              user._id
            );
            return (
              <CourseCard
                key={course._id}
                course={course}
                currentUser={user} // Sera l'étudiant connecté
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                isEnrolled={isEnrolled}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM7 16l1.373-1.373C9.22 13.78 10.588 13 12 13s2.78.78 3.627 1.627L17 16"
            />
          </svg>
          <p className="mt-3 text-lg text-gray-600">
            Aucun cours n'est disponible pour le moment.
          </p>
          <p className="text-sm text-gray-500">
            Veuillez consulter cette page ultérieurement.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableCoursesPage;
