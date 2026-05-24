import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      window.location.href = "/dashboard";
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#111827",
          padding: "35px",
          borderRadius: "20px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>RankBoost AI</h1>

        <p style={{ color: "#9ca3af", marginBottom: "30px" }}>
          Login to analyze and grow your website SEO.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            Login
          </button>
        </form>

        <p style={{ marginTop: "20px", color: "#9ca3af" }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={{ color: "#38bdf8" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#020617",
  color: "#fff",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "15px",
};

export default Login;