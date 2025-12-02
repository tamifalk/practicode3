// src/register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      // שליחת בקשה לשרת — ודאי שהשרת שלך מאזין לנתיב הזה
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
        username,
        password,
      });

      // שמירת הטוקן
      localStorage.setItem("token", res.data.token);

      // עדכון ה־state באפליקציה
      onLogin();

      // הפניה לדף הראשי
      navigate("/");
    } catch (err) {
      console.error("❌ Register failed:", err);
      alert("Register failed, please try again");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#333" }}>Register</h2>
        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            style={{
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
          <input
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            style={{
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>
        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#007BFF" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
