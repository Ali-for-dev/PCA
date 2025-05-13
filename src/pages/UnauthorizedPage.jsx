import React from "react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        401 - Unauthorized
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Vous n'avez pas la permission d'accéder à cette page.
      </p>
      <button
        onClick={handleLoginRedirect}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow"
      >
        Se connecter
      </button>
    </div>
  );
};

export default UnauthorizedPage;
