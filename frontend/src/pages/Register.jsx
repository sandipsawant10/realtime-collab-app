import React from "react";
import { useState } from "react";
import { register } from "../services/authApi.js";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!username || !email || !password) {
        setError("All Fields Are Required");
      }
      const response = await register(username, email, password);
      if (!response) {
        setError("Registration failed");
        return;
      }
      setError("");
      setUsername("");
      setEmail("");
      setPassword("");

      navigate("/login");
    } catch (error) {
      setError(error.message || "Registration failed");
    }
  };
  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          required
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          value={email}
          required
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          required
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
