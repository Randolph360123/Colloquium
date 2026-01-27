import { useState, useEffect } from "react";
import LoginPage from "./Login.jsx";
import Chat from "./Chat/Chat.jsx";
import "./LoadingScreen.css";

function App() {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
    // Check if there’s a saved token or guest session
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

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
  }, []); // Runs ONCE on refresh

  return (
    <>
      {isLoggedIn || isGuestMode ? (
        <Chat />
      ) : (
        <LoginPage onLogin={() => setIsLoggedIn(true)}
          isGuestMode={() => setIsGuestMode(true)}
        />
      )}
    </>
  );
}

export default App;
