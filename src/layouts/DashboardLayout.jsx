import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
// import Sidebar from '../components/layout/Sidebar'; // Optionnel

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* <div className="flex flex-1"> */}
      {/* <Sidebar /> */} {/* Optionnel */}
      <main className="flex-1 p-6 lg:p-8 bg-gray-100">
        {/* Le contenu de la page protégée sera rendu ici */}
        <Outlet />
      </main>
      {/* </div> */}
    </div>
  );
};

export default DashboardLayout;
