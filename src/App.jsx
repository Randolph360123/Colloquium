import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Login.jsx";
import Chat from "./Chat/Chat.jsx";
import "./LoadingScreen.css";

function App() {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if there’s a saved token or guest session
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.isGuest) {
      // Auto-logout guests on refresh
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      return;
    }

    if (token || user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Main chat route, only accessible if logged in */}
        <Route
          path="/"
          element={isLoggedIn || isGuestMode ? <Chat /> : <Navigate to="/login" />}
        />

        {/* Login route */}
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={() => setIsLoggedIn(true)}
              isGuestMode={() => setIsGuestMode(true)}
            />
          }
        />

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
