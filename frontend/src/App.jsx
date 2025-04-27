// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProfPage from "./Pages/ProfPage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import VerifyOTP from "./Pages/VerifyOtp";
import Welcome from "./Pages/Welcome";
import LandingPage from "./Pages/LandingPage";  // ✅ L'import est correct
import Ressource from "./Pages/Ressource";
// ✅ Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/landingpage" />;  // ✅ redirection vers le bon path (minuscule)
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/landingpage" />} />  {/* ✅ redirection de base */}
      
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
        <Route path="/landingpage" element={<LandingPage />} />  {/* ✅ ajouté ici */}
        <Route path="/profpage" element={<ProfPage />} /> 
        <Route path="/ressource" element={<Ressource />} />  {/* ✅ ajouté ici */}
        <Route path="*" element={<Navigate to="/" />} />  {/* catch-all */}
      </Routes>
    </Router>
  );
};

export default App;
