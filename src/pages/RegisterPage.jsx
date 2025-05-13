import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../api/services"; // Assurez-vous que le chemin est correct
import { useAuth } from "../contexts/AuthContext"; // Décommentez si vous voulez connecter l'utilisateur après l'inscription

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth(); // Décommentez si vous utilisez le contexte pour connecter l'utilisateur

  // États pour les champs du formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("etudiant"); // Rôle par défaut
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation simple côté client
    if (!name || !email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name,
        email,
        password,
        role,
      };
      // Appel à l'API d'inscription
      const response = await authService.register(userData);

      // Affichage d'un message de succès
      setSuccess(
        "Inscription réussie ! Vous allez être redirigé vers la page de connexion."
      );

      if (response.data && response.data.token) {
        contextLogin(response.data.token, response.data); // Assurez-vous que contextLogin gère le token et les données utilisateur
        setTimeout(() => {
          navigate(
            role === "professeur"
              ? "/professor/my-courses"
              : "/student/available-courses"
          ); // Ou '/dashboard'
        }, 2000);
      } else {
        // Redirection vers la page de connexion si pas de connexion automatique
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }

      // Redirection vers la page de connexion après un court délai
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      // Gestion des erreurs de l'API
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer."
        );
      }
      console.error("Erreur d'inscription:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Créer un compte
        </h2>

        {/* Affichage des messages d'erreur ou de succès */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4"
            role="alert"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4"
            role="alert"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Champ Nom Complet */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="John Doe"
            />
          </div>

          {/* Champ Email */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Adresse e-mail
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="email@example.com"
            />
          </div>

          {/* Champ Mot de passe */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="••••••••"
            />
          </div>

          {/* Champ Confirmation du Mot de passe */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="••••••••"
            />
          </div>

          {/* Champ Rôle */}
          <div className="mb-8">
            <label
              htmlFor="role"
              className="block text-gray-700 text-sm font-semibold mb-2"
            >
              Je suis un(e)
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="shadow-sm bg-white border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="etudiant">Étudiant</option>
              <option value="professeur">Professeur</option>
              {/* Le rôle 'admin' est généralement géré différemment, pas par auto-inscription */}
            </select>
          </div>

          {/* Bouton d'inscription */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </div>
        </form>

        {/* Lien vers la page de connexion */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Vous avez déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
