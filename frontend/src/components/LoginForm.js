import React, { useState } from "react";
import axios from "axios";

const LoginForm = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await axios.post("/users/login", { username, password });
      console.log("Login successful:", response.data);
      
      // Create user data object with correct structure
      const userData = {
        username: response.data.username,
        id: response.data._id,
        token: response.data.token
      };
      
      // Call onLogin with the properly structured data
      onLogin(userData);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error("Error logging in:", error);
      
      if (error.response) {
        if (error.response.status === 400) {
          setError("Invalid username or password");
        } else {
          setError("Login failed. Please try again.");
        }
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Error setting up request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;