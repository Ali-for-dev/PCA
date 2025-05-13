import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import AuthLayout from "../layouts/AuthLayout"; // Layout pour les pages Login/Register
import DashboardLayout from "../layouts/DashboardLayout"; // Layout pour les pages après connexion

// Pages publiques
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// Pages protégées (communes)
import DashboardPage from "../pages/DashboardPage";
// Importez vos autres pages ici...
import CourseListPage from "../pages/CourseListPage"; // Page pour voir tous les cours
import CourseDetailPage from "../pages/CourseDetailPage"; // Page détails d'un cours
import NotFoundPage from "../pages/NotFoundPage"; // Page 404
import UnauthorizedPage from "../pages/UnauthorizedPage"; // Page pour accès refusé (403)

// Pages spécifiques aux rôles
// Admin
import ManageUsersPage from "../pages/Admin/ManageUsersPage";
// Professeur
import MyCoursesPage from "../pages/Professor/MyCoursesPage";
// Etudiant
import StudentMyGradesPage from "../pages/Student/MyGradesPage";
import AvailableCoursesPage from "../pages/Student/AvailableCoursesPage"; // Peut être la même que CourseListPage avec filtre

const AppRouter = () => {
  return (
    <Routes>
      {/* Routes Publiques (dans un layout spécifique si besoin) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Routes Protégées (dans le layout du tableau de bord) */}
      <Route element={<DashboardLayout />}>
        {" "}
        {/* Layout commun pour les pages connectées */}
        {/* Route de base protégée (tous les rôles connectés) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<CourseListPage />} />{" "}
          {/* Liste des cours */}
          <Route
            path="/courses/:courseId"
            element={<CourseDetailPage />}
          />{" "}
          {/* Détails d'un cours */}
          {/* Ajoutez d'autres routes accessibles à tous les rôles connectés ici */}
        </Route>
        {/* Routes spécifiques Admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/users" element={<ManageUsersPage />} />
          {/* Ajoutez d'autres routes admin ici */}
        </Route>
        {/* Routes spécifiques Professeur */}
        <Route element={<ProtectedRoute allowedRoles={["professeur"]} />}>
          <Route path="/professor/my-courses" element={<MyCoursesPage />} />
          {/* Note: La gestion des notes pourrait être dans CourseDetailPage ou une page dédiée */}
          {/* <Route path="/professor/assign-grades/:courseId" element={<AssignGradesPage />} /> */}
          {/* Ajoutez d'autres routes prof ici */}
        </Route>
        {/* Routes spécifiques Étudiant */}
        <Route element={<ProtectedRoute allowedRoles={["etudiant"]} />}>
          <Route path="/student/my-grades" element={<StudentMyGradesPage />} />
          {/* La page pour voir les cours disponibles pourrait être la même que /courses */}
          <Route
            path="/student/available-courses"
            element={<AvailableCoursesPage />}
          />
          {/* Ajoutez d'autres routes étudiant ici */}
        </Route>
      </Route>

      {/* Route pour Accès Non Autorisé */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Route 404 (Page non trouvée) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
