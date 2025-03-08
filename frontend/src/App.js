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

  // Check for existing user session on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleLogin = (dataObj) => {
    if (!dataObj || !dataObj.token) {
      console.error("Invalid login data received");
      return;
    }
    const userData = {
      username: dataObj.username,
      id: dataObj.id,
      // Add other relevant user data
    };
    localStorage.setItem("token", dataObj.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setShowLoginForm(false);
  };

  const handleRegister = (userData) => {
    if (!userData || !userData.token) {
      console.error("Invalid registration data received");
      return;
    }
    const userInfo = {
      username: userData.username,
      id: userData.id,
      // Add other relevant user data
    };
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
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
