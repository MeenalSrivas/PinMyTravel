import React, { useState, useEffect } from "react";
import axios from "axios";


const LoginForm = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  

  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("users/login", { username, password });
      console.log("Response data:", res.data); // Log the response data

      const dataObj = {
        _id: res.data._id,
        username: res.data.username,
        token: res.data.token,
    }

      
      
  
  

      onLogin(dataObj);
      localStorage.setItem('token', res.data.token);
     // Assuming the server sends a 'user' property in the response
     

      
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Invalid credentials");
    }

    
  };
  

 
  

  

 
  return (
    <div className="form-overlay">
      <div className="form-container">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
    </div>
    </div>
  );
};

export default LoginForm;