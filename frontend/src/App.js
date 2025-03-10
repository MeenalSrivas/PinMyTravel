import React, {useState, useEffect} from 'react';
import Navbar from './components/navbar.jsx';
import Map from './components/map.jsx';
import LoginForm from './components/LoginForm.js';
import RegisterForm from './components/RegisterForm.js'; 
import "./components/form.css";
import "./App.css";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Debug user state changes
  useEffect(() => {
    console.log("App.js - User state changed:", user);
  }, [user]);

  // Check for existing user session on component mount
  useEffect(() => {
    // Clear any potentially invalid session data
    const clearSession = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setInitializing(false);
    };

    const verifyToken = async (token, savedUserData) => {
      try {
        console.log("Verifying token with backend...");
        // Make a request to verify the token is still valid
        const response = await axios.get("/users/verify", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.status === 200) {
          console.log("Token verified successfully");
          setUser(savedUserData);
        } else {
          console.log("Token verification failed");
          clearSession();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        clearSession();
      } finally {
        setInitializing(false);
      }
    };

    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      console.log("App.js - Checking session:", { token: !!token, savedUser });
      
      // Validate both token and user data exist
      if (!token || !savedUser) {
        clearSession();
        return;
      }
      
      // Parse and validate user data
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser || !parsedUser.username || !parsedUser.id) {
        console.error("Invalid user data in localStorage");
        clearSession();
        return;
      }
      
      // Verify the token with the backend
      verifyToken(token, parsedUser);
      
    } catch (error) {
      console.error("Error restoring session:", error);
      clearSession();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    console.log("User logged out");
  };

  const handleLogin = (userData) => {
    console.log("Login data received:", userData);
    
    if (!userData || !userData.token || !userData.username || !userData.id) {
      console.error("Invalid login data received:", userData);
      return;
    }
    
    // Create a consistent user object structure
    const userInfo = {
      username: userData.username,
      id: userData.id
    };
    
    // Store both token and user data
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    
    // Update application state
    setUser(userInfo);
    console.log("User logged in:", userInfo.username);
    
    // Close the login form
    setShowLoginForm(false);
  };

  const handleRegister = (userData) => {
    console.log("Registration data received:", userData);
    
    if (!userData || !userData.token || !userData.username || !userData.id) {
      console.error("Invalid registration data received:", userData);
      return;
    }
    
    // Create a consistent user object structure
    const userInfo = {
      username: userData.username,
      id: userData.id
    };
    
    // Store both token and user data
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    
    // Update application state
    setUser(userInfo);
    console.log("User registered and logged in:", userInfo.username);
    
    // Close the registration form
    setShowRegisterForm(false);
  };

  // Show loading state while initializing
  if (initializing) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar user={user} />
      <Map user={user}/>

      {showLoginForm && (
        <LoginForm
          onLogin={handleLogin}
          onClose={() => setShowLoginForm(false)}
        />
      )}

      {showRegisterForm && (
        <RegisterForm
          onRegister={handleRegister}
          onClose={() => setShowRegisterForm(false)}
        />
      )}

      {!user && (
        <div className="auth-buttons">
          <button 
            className="auth-button login" 
            onClick={() => setShowLoginForm(true)}
          >
            <span className="button-icon">👤</span>
            Login
          </button>
          <button 
            className="auth-button register" 
            onClick={() => setShowRegisterForm(true)}
          >
            <span className="button-icon">✏️</span>
            Register
          </button>
        </div>
      )}

      {user && (
        <button 
          className="auth-button logout" 
          onClick={handleLogout}
        >
          <span className="button-icon">🚪</span>
          Logout
        </button>
      )}
    </div>
  );
}

export default App;
