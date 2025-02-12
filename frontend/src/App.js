import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import "./styles.css"; // Import global styles

const App = () => {
  const [token, setToken] = useState(null); 
  const [showSignup, setShowSignup] = useState(false);


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <div className="app-container">
      {token ? (
        <Dashboard />
      ) : showSignup ? (
        <Signup setToken={setToken} togglePage={() => setShowSignup(false)} />
      ) : (
        <Login setToken={setToken} togglePage={() => setShowSignup(true)} />
      )}
    </div>
  );
};

export default App;
