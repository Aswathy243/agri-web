// src/pages/WelcomePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';
const WelcomePage = () => {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');

 return (
  <div className="welcome-container">
    <div className="welcome-content">
      <h1 className="welcome-title">🌿 Idukki Agro Portal 🌿</h1>
      <p className="welcome-description">
        A Digital Agricultural Companion for the farmers of Idukki.
        Access customized support, expert advice, weather-based recommendations, and more.
      </p>
      <div className="button-container">
        <button
          onClick={handleLogin}
          className="login-button"
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          className="register-button"
        >
          Register
        </button>
      </div>
    </div>
  </div>
);
};

export default WelcomePage;
