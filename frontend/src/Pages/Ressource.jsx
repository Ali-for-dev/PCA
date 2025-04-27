// src/Pages/Ressource.jsx
import React, { useState } from "react";

const Ressource = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ressource à ajouter :", { title, description });

    // Exemple : ici tu ferais un POST vers ton backend
    // axios.post(...)

    setShowModal(false); // Fermer la modale après soumission
    setTitle("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar avec boutons */}
      <header className="bg-white shadow py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Ressources</h1>
        <div className="space-x-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Ajouter
          </button>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Modifier</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Supprimer</button>
        </div>
      </header>

      {/* ✅ Modale */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Ajouter une ressource</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Sélectionner un fichier</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  className="mt-1 block w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenu */}
      <main className="p-6 space-y-10">
        {/* Vos ressources */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Vos ressources</h2>
          <div className="bg-white p-4 rounded shadow">Aucune ressource pour l’instant.</div>
        </section>

        {/* Autres ressources */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Autres ressources</h2>
          <div className="bg-white p-4 rounded shadow">Pas encore de suggestions.</div>
        </section>
      </main>
    </div>
  );
};

export default Ressource;
