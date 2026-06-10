import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input style={styles.input} type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      {message && <p style={styles.error}>{message}</p>}
      <p style={styles.link}>Don't have an account? <Link to="/signup">Sign Up</Link></p>
      <p style={styles.link}><Link to="/forgot-password">Forgot Password?</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "60px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", fontFamily: "Arial, sans-serif" },
  title: { textAlign: "center", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px 14px", fontSize: "15px", border: "1px solid #ccc", borderRadius: "6px" },
  button: { padding: "10px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
  error: { textAlign: "center", color: "red", marginTop: "10px" },
  link: { textAlign: "center", marginTop: "15px" },
};

export default Login;