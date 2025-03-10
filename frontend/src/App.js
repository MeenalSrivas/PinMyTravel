import React, {useState, useEffect} from 'react';
import Navbar from './components/navbar.jsx';
import Map from './components/map.jsx';
import LoginForm from './components/LoginForm.js';
import RegisterForm from './components/RegisterForm.js'; 
import "./components/form.css";

function App() {
  const [user, setUser] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

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
      
      // Set user state with valid data
      setUser(parsedUser);
      console.log("Session restored for user:", parsedUser.username);
      
      // Optional: Verify token with backend
      // This would be the most secure approach
      // verifyToken(token).catch(() => clearSession());
      
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
          <button onClick={() => setShowLoginForm(true)}>Login</button>
          <button onClick={() => setShowRegisterForm(true)}>Register</button>
        </div>
      )}

      {user && (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
}

export default App;
