import React, { useState } from "react";
import axios from "axios";
import "../../src/styles.css"; // Import global styles

const Login = ({ setToken, togglePage }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "", server: "" });

  const validateForm = () => {
    let valid = true;
    let newErrors = { email: "", password: "", server: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
      valid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const res = await axios.post("http://localhost:5000/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setToken(res.data.token);
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        server: "Invalid credentials",
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              className={`input-field ${errors.email ? "input-error" : ""}`}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              className={`input-field ${errors.password ? "input-error" : ""}`}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {errors.server && <p className="error-message server-error">{errors.server}</p>}

          <button className="btn-submit" type="submit">Login</button>
        </form>

        <p>
          Don't have an account? <span className="link" onClick={togglePage}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
