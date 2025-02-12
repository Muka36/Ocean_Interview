import React, { useState } from "react";
import axios from "axios";

const Signup = ({ setToken, togglePage }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    server: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      server: "",
    };

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, server: "" }));

    try {
      // Register the user
      const res = await axios.post("http://localhost:5000/register", formData);

      // Automatically log in the user
      const loginRes = await axios.post("http://localhost:5000/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", loginRes.data.token);
      setToken(loginRes.data.token);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
      setErrors((prev) => ({
        ...prev,
        server: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup} noValidate>
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? "error" : ""}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="error-message">{errors.username}</p>
            )}
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.value}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
              disabled={isLoading}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "error" : ""}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          {errors.server && (
            <p className="error-message server-error">{errors.server}</p>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <span className="link" onClick={togglePage}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;