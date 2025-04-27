import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./utils/axiosConfig"; // Import axios config
import "./index.css"; // Assuming you have a CSS file with Tailwind imports
import React from "react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
