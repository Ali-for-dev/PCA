// src/pages/CourseDetailPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { courseService, gradeService } from "../api/services"; // Assurez-vous d'importer gradeService
import { useAuth } from "../contexts/AuthContext";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [grades, setGrades] = useState([]); // Pour stocker les notes du cours
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State pour la gestion des notes par le professeur
  const [selectedStudentIdForGrade, setSelectedStudentIdForGrade] =
    useState("");
  const [gradeValueInput, setGradeValueInput] = useState("");
  const [gradeError, setGradeError] = useState("");
  const [gradeSuccess, setGradeSuccess] = useState("");

  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const courseResponse = await courseService.getCourseById(courseId);
      setCourse(courseResponse.data);

      // Si l'utilisateur est le professeur du cours ou un admin, ou un étudiant inscrit, récupérer les notes
      if (courseResponse.data && user) {
        const courseData = courseResponse.data;
        const isProfessorOfCourse =
          user.role === "professeur" && user._id === courseData.professor?._id;
        const isAdmin = user.role === "admin";
        const isEnrolledStudent =
          user.role === "etudiant" &&
          courseData.studentsEnrolled?.some((s) => s._id === user._id);

        if (isAdmin || isProfessorOfCourse || isEnrolledStudent) {
          const gradesResponse = await gradeService.getGradesByCourse(courseId);
          setGrades(gradesResponse.data || []);
        }
      }
    } catch (err) {
      setError("Impossible de charger les détails du cours.");
      console.error(
        "Erreur fetchCourseDetails:",
        err.response?.data?.message || err.message
      );
      if (err.response?.status === 404) {
        navigate("/404"); // Ou une page "Cours non trouvé"
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate, user]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  // --- Actions sur le cours ---
  const handleDeleteCourse = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible."
      )
    ) {
      try {
        await courseService.deleteCourse(courseId);
        alert("Cours supprimé avec succès.");
        navigate("/courses");
      } catch (err) {
        alert(
          `Erreur lors de la suppression: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    }
  };

  const handleEnroll = async () => {
    try {
      await courseService.enrollCourse(courseId);
      alert("Inscription réussie !");
      fetchCourseDetails(); // Recharger les détails pour mettre à jour l'UI
    } catch (err) {
      alert(
        `Erreur d'inscription: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleUnenroll = async () => {
    try {
      await courseService.unenrollCourse(courseId);
      alert("Désinscription réussie !");
      fetchCourseDetails(); // Recharger
    } catch (err) {
      alert(
        `Erreur de désinscription: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // --- Gestion des notes (par le professeur) ---
  const handleAssignGradeSubmit = async (e) => {
    e.preventDefault();
    setGradeError("");
    setGradeSuccess("");
    if (!selectedStudentIdForGrade || !gradeValueInput) {
      setGradeError("Veuillez sélectionner un étudiant et entrer une note.");
      return;
    }
    try {
      await gradeService.assignOrUpdateGrade({
        studentId: selectedStudentIdForGrade,
        courseId: courseId,
        gradeValue: gradeValueInput,
      });
      setGradeSuccess(
        `Note '${gradeValueInput}' assignée avec succès à l'étudiant.`
      );
      setGradeValueInput(""); // Réinitialiser le champ
      //setSelectedStudentIdForGrade(''); // Optionnel: réinitialiser la sélection
      fetchCourseDetails(); // Recharger les détails pour mettre à jour la liste des notes
    } catch (err) {
      setGradeError(
        `Erreur lors de l'assignation de la note: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // --- Vérifications des rôles et permissions ---
  const isProfessorOfThisCourse =
    user?.role === "professeur" && user?._id === course?.professor?._id;
  const isAdmin = user?.role === "admin";
  const canManageCourse = isAdmin || isProfessorOfThisCourse;
  const isEnrolled =
    user?.role === "etudiant" &&
    course?.studentsEnrolled?.some((s) => s._id === user._id);

  const studentGrade = isEnrolled
    ? grades.find((g) => g.student?._id === user._id)
    : null;

  // --- Rendu ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Chargement du cours...
      </div>
    );
  }
  if (error || !course) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600 bg-red-100 rounded-md">
        {error || "Cours non trouvé."}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* En-tête avec titre et actions principales */}
      <div className="mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          {course.title}
        </h1>
        <p className="text-lg text-gray-600">
          Code: <span className="font-semibold">{course.code}</span>
        </p>
        <p className="text-md text-gray-500">
          Professeur:{" "}
          <span className="font-medium">
            {course.professor?.name || "N/A"} (
            {course.professor?.email || "N/A"})
          </span>
        </p>

        {/* Actions pour Admin / Professeur du cours */}
        {canManageCourse && (
          <div className="mt-4 flex space-x-3">
            <Link
              to={`/courses/${courseId}/edit`} // Créez cette route et page pour l'édition
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150"
            >
              Modifier le Cours
            </Link>
            <button
              onClick={handleDeleteCourse}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150"
            >
              Supprimer le Cours
            </button>
          </div>
        )}

        {/* Actions pour Étudiants */}
        {user?.role === "etudiant" && (
          <div className="mt-4">
            {isEnrolled ? (
              <button
                onClick={handleUnenroll}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150"
              >
                Se désinscrire du cours
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150"
              >
                S'inscrire au cours
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description du cours */}
      <div className="mb-8 bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Description
        </h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
          {course.description || "Aucune description fournie."}
        </p>
      </div>

      {/* Affichage de la note pour l'étudiant connecté */}
      {isEnrolled && studentGrade && (
        <div className="mb-8 bg-blue-50 p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-blue-700 mb-3">
            Votre Note
          </h2>
          <p className="text-xl text-blue-600">
            Note: <span className="font-bold">{studentGrade.gradeValue}</span>
          </p>
          <p className="text-sm text-gray-500">
            Assignée par: {studentGrade.assignedBy?.name || "N/A"} le{" "}
            {new Date(studentGrade.assignedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Liste des étudiants inscrits (visible par Admin / Prof du cours) */}
      {canManageCourse &&
        course.studentsEnrolled &&
        course.studentsEnrolled.length > 0 && (
          <div className="mb-8 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Étudiants Inscrits ({course.studentsEnrolled.length})
            </h2>
            <ul className="divide-y divide-gray-200">
              {course.studentsEnrolled.map((student) => (
                <li
                  key={student._id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-md font-medium text-gray-800">
                      {student.name}
                    </p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                  {/* Afficher la note de l'étudiant si elle existe */}
                  {isProfessorOfThisCourse &&
                    (() => {
                      const currentStudentGrade = grades.find(
                        (g) => g.student?._id === student._id
                      );
                      return currentStudentGrade ? (
                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Note: {currentStudentGrade.gradeValue}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Pas de note
                        </span>
                      );
                    })()}
                </li>
              ))}
            </ul>
          </div>
        )}
      {canManageCourse &&
        course.studentsEnrolled &&
        course.studentsEnrolled.length === 0 && (
          <div className="mb-8 bg-white p-6 shadow-md rounded-lg text-center text-gray-500 italic">
            Aucun étudiant n'est actuellement inscrit à ce cours.
          </div>
        )}

      {/* Section d'assignation des notes (visible par le Professeur du cours) */}
      {isProfessorOfThisCourse && (
        <div className="mb-8 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Assigner/Modifier une Note
          </h2>
          {course.studentsEnrolled && course.studentsEnrolled.length > 0 ? (
            <form onSubmit={handleAssignGradeSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="studentSelect"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sélectionner un étudiant:
                </label>
                <select
                  id="studentSelect"
                  value={selectedStudentIdForGrade}
                  onChange={(e) => {
                    setSelectedStudentIdForGrade(e.target.value);
                    // Pré-remplir la note si elle existe déjà pour cet étudiant
                    const existingGrade = grades.find(
                      (g) => g.student?._id === e.target.value
                    );
                    setGradeValueInput(
                      existingGrade ? existingGrade.gradeValue : ""
                    );
                    setGradeError("");
                    setGradeSuccess("");
                  }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">-- Choisir un étudiant --</option>
                  {course.studentsEnrolled.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="gradeValue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Note:
                </label>
                <input
                  type="text"
                  id="gradeValue"
                  value={gradeValueInput}
                  onChange={(e) => setGradeValueInput(e.target.value)}
                  placeholder="Ex: A, 18/20, Pass"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {gradeError && (
                <p className="text-sm text-red-600">{gradeError}</p>
              )}
              {gradeSuccess && (
                <p className="text-sm text-green-600">{gradeSuccess}</p>
              )}
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150"
                disabled={!selectedStudentIdForGrade}
              >
                Assigner la Note
              </button>
            </form>
          ) : (
            <p className="text-gray-500 italic">
              Aucun étudiant inscrit pour assigner des notes.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
