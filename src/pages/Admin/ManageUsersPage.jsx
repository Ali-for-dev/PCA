// src/pages/Admin/ManageUsersPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  userService,
  authService, // authService pour la création (register)
} from "../../api/services";
import { useAuth } from "../../contexts/AuthContext"; // Pour vérifier que l'utilisateur est admin

// Icônes simples pour les boutons
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path
      fillRule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clipRule="evenodd"
    />
  </svg>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const ManageUsersPage = () => {
  const { user: adminUser } = useAuth(); // L'admin connecté
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // États pour la modale et le formulaire
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' ou 'edit'
  const [currentUserData, setCurrentUserData] = useState(null); // Pour l'édition
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "etudiant", // Rôle par défaut pour la création
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError("Impossible de charger la liste des utilisateurs.");
      console.error("Erreur fetchUsers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // S'assurer que seul un admin accède à cette logique
    if (adminUser?.role === "admin") {
      fetchUsers();
    } else {
      setError("Accès non autorisé."); // Ce message ne devrait pas apparaître si ProtectedRoute fonctionne
      setLoading(false);
    }
  }, [fetchUsers, adminUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (mode, userToEdit = null) => {
    setModalMode(mode);
    setIsModalOpen(true);
    setSuccessMessage("");
    setError(""); // Clear form-specific errors
    if (mode === "edit" && userToEdit) {
      setCurrentUserData(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        password: "", // Ne pas pré-remplir le mot de passe pour l'édition
      });
    } else {
      // create mode
      setCurrentUserData(null);
      setFormData({ name: "", email: "", password: "", role: "etudiant" });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUserData(null);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");

    try {
      if (modalMode === "create") {
        if (!formData.password) {
          setError("Le mot de passe est requis pour la création.");
          return;
        }
        // Utiliser authService.register pour la création, car il gère le hashage du mdp
        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        setSuccessMessage("Utilisateur créé avec succès !");
      } else if (modalMode === "edit" && currentUserData) {
        // Pour la mise à jour, ne pas envoyer le mot de passe s'il n'est pas changé
        // Le backend actuel userService.updateUser ne gère pas la MAJ du mot de passe.
        // C'est généralement une action séparée (reset password).
        const dataToUpdate = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        await userService.updateUser(currentUserData._id, dataToUpdate);
        setSuccessMessage("Utilisateur mis à jour avec succès !");
      }
      fetchUsers(); // Recharger la liste des utilisateurs
      closeModal();
    } catch (err) {
      console.error(
        `Erreur ${
          modalMode === "create" ? "création" : "mise à jour"
        } utilisateur:`,
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || `Échec de l'opération.`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'utilisateur ${userName} ? Cette action est irréversible.`
      )
    ) {
      try {
        await userService.deleteUser(userId);
        setSuccessMessage(`Utilisateur ${userName} supprimé avec succès.`);
        fetchUsers(); // Recharger la liste
      } catch (err) {
        setError(
          `Erreur lors de la suppression de ${userName}: ${
            err.response?.data?.message || err.message
          }`
        );
        console.error("Erreur handleDeleteUser:", err);
      }
    }
  };

  // Vérification du rôle admin pour l'affichage du contenu
  if (adminUser?.role !== "admin" && !loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 text-lg bg-red-100 p-4 rounded-md">
          Accès non autorisé. Cette page est réservée aux administrateurs.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Chargement des utilisateurs...
      </div>
    );
  }

  // Ne pas afficher d'erreur générale si la page est protégée et que le chargement est terminé
  // L'erreur d'accès non autorisé est gérée ci-dessus.
  // if (error && adminUser?.role === 'admin') {
  //   return (
  //     <div className="container mx-auto p-6 text-center text-red-500 bg-red-100 rounded-md">
  //       {error}
  //       <button onClick={fetchUsers} className="mt-2 bg-blue-500 text-white py-1 px-3 rounded">Réessayer</button>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestion des Utilisateurs
        </h1>
        <button
          onClick={() => openModal("create")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center"
        >
          <PlusIcon /> Ajouter un Utilisateur
        </button>
      </div>

      {/* Affichage des messages de succès/erreur globaux pour la page */}
      {successMessage && !isModalOpen && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      {error && !isModalOpen && adminUser?.role === "admin" && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}{" "}
          <button
            onClick={fetchUsers}
            className="ml-2 font-semibold hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nom
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rôle
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((userItem) => (
              <tr
                key={userItem._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {userItem.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userItem.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {userItem.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => openModal("edit", userItem)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center"
                    title="Modifier"
                  >
                    <EditIcon /> Modifier
                  </button>
                  {/* Empêcher l'admin de se supprimer lui-même */}
                  {adminUser._id !== userItem._id && (
                    <button
                      onClick={() =>
                        handleDeleteUser(userItem._id, userItem.name)
                      }
                      className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                      title="Supprimer"
                    >
                      <DeleteIcon /> Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modale pour Créer/Modifier Utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {modalMode === "create"
                  ? "Ajouter un Nouvel Utilisateur"
                  : "Modifier l'Utilisateur"}
              </h3>
              <form
                onSubmit={handleSubmitForm}
                className="mt-2 text-left space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                {modalMode === "create" && (
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Rôle
                  </label>
                  <select
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="professeur">Professeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                {/* Affichage des erreurs spécifiques au formulaire */}
                {error && isModalOpen && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </p>
                )}

                <div className="items-center px-4 py-3 space-x-4 flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {modalMode === "create"
                      ? "Créer Utilisateur"
                      : "Sauvegarder les Modifications"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
