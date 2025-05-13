// src/pages/CourseListPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { courseService } from "../api/services";
import { useAuth } from "../contexts/AuthContext";

// Un composant simple pour une carte de cours
const CourseCard = ({
  course,
  currentUser,
  onEnroll,
  onUnenroll,
  isEnrolled,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="p-6">
        {/* Image de cours optionnelle ici */}
        {/* <img src={course.imageUrl || 'https://via.placeholder.com/400x200'} alt={course.title} className="w-full h-40 object-cover mb-4 rounded"/> */}

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
            to={`/courses/${course._id}`}
            className="w-full sm:w-auto text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out text-sm"
          >
            Voir Détails
          </Link>
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

const CourseListPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth(); // Informations sur l'utilisateur connecté

  // Fonction pour récupérer les cours
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await courseService.getAllCourses();
      setCourses(response.data || []);
    } catch (err) {
      setError(
        "Impossible de charger la liste des cours. Veuillez réessayer plus tard."
      );
      console.error(
        "Erreur fetchCourses:",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Gérer l'inscription d'un étudiant à un cours
  const handleEnroll = async (courseId) => {
    if (!user || user.role !== "etudiant") return;
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
      alert("Inscription réussie !"); // Remplacer par un système de notification (toast)
    } catch (err) {
      alert(
        `Erreur lors de l'inscription: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Gérer la désinscription d'un étudiant d'un cours
  const handleUnenroll = async (courseId) => {
    if (!user || user.role !== "etudiant") return;
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
      alert("Désinscription réussie !"); // Remplacer par un toast
    } catch (err) {
      alert(
        `Erreur lors de la désinscription: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-gray-700">
          Chargement des cours...
        </div>
        {/* Vous pouvez ajouter un spinner ici */}
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 text-lg bg-red-100 p-4 rounded-md">
          {error}
        </p>
        <button
          onClick={fetchCourses}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">
          Catalogue des Cours
        </h1>
        {/* Bouton pour créer un cours, visible seulement par admin ou professeur */}
        {(user?.role === "admin" || user?.role === "professeur") && (
          <Link
            to="/courses/create" // Assurez-vous que cette route et la page de création existent
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out text-sm sm:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 inline-block mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Créer un Cours
          </Link>
        )}
      </div>

      {/* Grille des cours */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {courses.map((course) => {
            // Vérifie si l'étudiant actuel est inscrit à ce cours
            // `studentsEnrolled` est supposé être un tableau d'IDs d'étudiants
            const isEnrolled =
              user?.role === "etudiant" &&
              (course.studentsEnrolled || []).includes(user._id);
            return (
              <CourseCard
                key={course._id}
                course={course}
                currentUser={user}
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
            Revenez plus tard ou contactez l'administration.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseListPage;
