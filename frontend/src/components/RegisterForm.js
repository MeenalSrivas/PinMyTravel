import React, { useState } from "react";
import axios from "axios";

const RegisterForm = ({ onRegister, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const[email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("users/register", { username, password,email });
      console.log(res.data);
      const { user, token } = res.data;
      
      onRegister(user.username, token); // Pass username and token to parent
      
    } catch (error) {
      console.log("Error registering:", error);
      alert("Registration failed");
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
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Register</button>
    </form>
    </div>
    </div>
  );
};

export default RegisterForm;