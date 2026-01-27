// src/LoadingScreen.jsx
import React from "react";
import "./App.css";
import "./LoadingScreen.css";

function LoadingScreen() {
  return (
    <div className="loading-container">
      <img src="/LogoReal4.png" alt="Ataraxia Logo" className="loading-logo" />
      <h2 style={{ fontStyle: 'italic' }}>Your everyday partner in feeling great</h2>
    </div>
  );
}

export default LoadingScreen;