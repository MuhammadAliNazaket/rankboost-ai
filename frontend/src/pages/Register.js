import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
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
      const response = await API.post(
        "/auth/register",
        formData
      );

      alert(response.data.message);

      window.location.href = "/";
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
        <h1 style={{ marginBottom: "10px" }}>Create Account</h1>

        <p style={{ color: "#9ca3af", marginBottom: "30px" }}>
          Join RankBoost AI and improve your website SEO.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            required
            style={inputStyle}
          />

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
            Register
          </button>
        </form>

        <p style={{ marginTop: "20px", color: "#9ca3af" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#38bdf8" }}>
            Login
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

export default Register;