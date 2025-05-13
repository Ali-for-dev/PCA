import React from "react";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <div className="App">
      {/* Le AppRouter gère quelle page afficher */}
      <AppRouter />
    </div>
  );
}

export default App;
