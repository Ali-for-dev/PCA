// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// Importer les services si vous voulez afficher des statistiques dynamiques
// import { userService, courseService, gradeService } from '../api/services';

// Icônes pour les cartes (optionnel, vous pouvez utiliser Heroicons ou une autre librairie)
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-blue-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const CoursesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.253v11.494m0 0a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm0 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
    />
    <path d="M12 6.253V4M12 17.747V19.5M3.75 12H2M21.75 12H20m-1.932-5.068l.068-.068M5.682 17.318l-.068.068m12.636 0l.068.068M5.682 6.682l-.068-.068m12.636 0l.068-.068" />{" "}
    {/* Simplified book/courses icon */}
  </svg>
);

const GradesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-indigo-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const DashboardCard = ({
  title,
  description,
  linkTo,
  icon,
  bgColor = "bg-white",
}) => (
  <Link
    to={linkTo}
    className={`block p-6 ${bgColor} rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1`}
  >
    <div className="flex items-center space-x-4 mb-3">
      {icon}
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 text-sm">{description}</p>
  </Link>
);

const DashboardPage = () => {
  const { user } = useAuth();
  // const [stats, setStats] = useState({ userCount: 0, courseCount: 0, enrolledCourses: 0 });
  // const [loadingStats, setLoadingStats] = useState(true);

  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     if (!user) return;
  //     setLoadingStats(true);
  //     try {
  //       // Exemple de récupération de stats (nécessite des endpoints API ou des calculs)
  //       if (user.role === 'admin') {
  //         const usersResponse = await userService.getAllUsers();
  //         const coursesResponse = await courseService.getAllCourses();
  //         setStats(prev => ({ ...prev, userCount: usersResponse.data.length, courseCount: coursesResponse.data.length }));
  //       } else if (user.role === 'etudiant') {
  //         // Pour un étudiant, il faudrait un endpoint pour ses cours ou filtrer
  //         // const enrolled = await courseService.getMyEnrolledCourses(); // Endpoint fictif
  //         // setStats(prev => ({ ...prev, enrolledCourses: enrolled.data.length }));
  //       }
  //       // Ajouter logique pour professeur...
  //     } catch (error) {
  //       console.error("Erreur de chargement des données du dashboard:", error);
  //     } finally {
  //       setLoadingStats(false);
  //     }
  //   };
  //   fetchDashboardData();
  // }, [user]);

  if (!user) {
    // Normalement, ProtectedRoute gère cela, mais au cas où.
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement des informations utilisateur...
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <p className="text-lg text-gray-700 mb-8">
        Vous avez un accès complet pour gérer la plateforme.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Gérer les Utilisateurs"
          description="Ajouter, modifier ou supprimer des utilisateurs (étudiants, professeurs)."
          linkTo="/admin/users"
          icon={<UsersIcon />}
        />
        <DashboardCard
          title="Gérer les Cours"
          description="Créer de nouveaux cours, modifier les existants et assigner des professeurs."
          linkTo="/courses" // La page CourseList permet déjà de créer si admin/prof
          icon={<CoursesIcon />}
        />
        {/* Ajouter d'autres cartes pour l'admin, ex: voir toutes les notes, statistiques globales */}
        <DashboardCard
          title="Statistiques (Exemple)"
          description="Voir les statistiques globales de la plateforme."
          linkTo="/admin/statistics" // Page fictive
          icon={<GradesIcon />} // Icône placeholder
          bgColor="bg-yellow-50 hover:bg-yellow-100"
        />
      </div>
    </>
  );

  const renderProfessorDashboard = () => (
    <>
      <p className="text-lg text-gray-700 mb-8">
        Gérez vos cours, vos étudiants et leurs notes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Mes Cours"
          description="Accéder à la liste de vos cours, modifier le contenu et voir les inscrits."
          linkTo="/professor/my-courses" // Ou "/courses" si la logique de filtrage est là
          icon={<CoursesIcon />}
        />
        <DashboardCard
          title="Assigner les Notes"
          description="Consulter et attribuer les notes pour les étudiants de vos cours."
          // Ce lien pourrait mener à la page "Mes Cours" où ils peuvent ensuite sélectionner un cours pour gérer les notes.
          linkTo="/professor/my-courses" // Ou une page dédiée si vous en avez une
          icon={<GradesIcon />}
        />
        <DashboardCard
          title="Créer un Cours"
          description="Mettre en place un nouveau cours que vous allez enseigner."
          linkTo="/courses/create" // Lien direct vers la création de cours
          icon={<CoursesIcon />}
          bgColor="bg-green-50 hover:bg-green-100"
        />
      </div>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <p className="text-lg text-gray-700 mb-8">
        Accédez à vos cours, notes et découvrez de nouvelles opportunités.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Cours Disponibles"
          description="Parcourir tous les cours et s'inscrire à ceux qui vous intéressent."
          linkTo="/student/available-courses" // Ou simplement "/courses" si CourseListPage gère bien tous les rôles
          icon={<CoursesIcon />}
        />
        <DashboardCard
          title="Mes Inscriptions"
          description="Voir les cours auxquels vous êtes actuellement inscrit."
          // Ce lien pourrait mener à "/courses" et l'étudiant voit son statut, ou une page filtrée.
          linkTo="/courses" // On peut ajouter un filtre plus tard ou une page dédiée
          icon={<CoursesIcon />}
          bgColor="bg-blue-50 hover:bg-blue-100"
        />
        <DashboardCard
          title="Mes Notes"
          description="Consulter vos notes pour les différents cours."
          linkTo="/student/my-grades"
          icon={<GradesIcon />}
        />
      </div>
    </>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 pb-6 border-b border-gray-300">
        <h1 className="text-4xl font-bold text-gray-800">
          Bienvenue, <span className="text-blue-600">{user.name}</span> !
        </h1>
        <p className="mt-2 text-xl text-gray-600">
          Vous êtes connecté en tant que :{" "}
          <span className="font-semibold capitalize text-indigo-700">
            {user.role}
          </span>
        </p>
      </div>

      {/* Contenu spécifique au rôle */}
      {user.role === "admin" && renderAdminDashboard()}
      {user.role === "professeur" && renderProfessorDashboard()}
      {user.role === "etudiant" && renderStudentDashboard()}

      {/* Section d'actions rapides communes ou d'informations */}
      <div className="mt-12 pt-8 border-t border-gray-300">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Profil et Paramètres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard
            title="Mon Profil"
            description="Voir ou modifier vos informations personnelles."
            linkTo="/profile" // Page de profil à créer
            icon={<UsersIcon />} // Placeholder icon
            bgColor="bg-gray-50 hover:bg-gray-100"
          />
          <DashboardCard
            title="Changer Mot de Passe"
            description="Mettre à jour votre mot de passe pour plus de sécurité."
            linkTo="/change-password" // Page de changement de mot de passe à créer
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.628 5.873M12 15a2 2 0 01-2-2m-4 0a6 6 0 017.628-5.873M12 5a2 2 0 012 2m-4 0a6 6 0 00-7.628 5.873M12 19a2 2 0 01-2-2m4 0a6 6 0 007.628-5.873"
                />
              </svg>
            } // Placeholder icon
            bgColor="bg-gray-50 hover:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
