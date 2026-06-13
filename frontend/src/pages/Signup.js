import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://ems-backend-kdk0.onrender.com/api/auth/signup", form);
      alert(res.data.message);
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sign Up</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} name="name" placeholder="Full Name" onChange={handleChange} required />
        <input style={styles.input} name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input style={styles.input} type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit" style={styles.button}>Register</button>
      </form>
      {message && <p style={styles.error}>{message}</p>}
      <p style={styles.link}>Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "60px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", fontFamily: "Arial, sans-serif" },
  title: { textAlign: "center", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px 14px", fontSize: "15px", border: "1px solid #ccc", borderRadius: "6px" },
  button: { padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
  error: { textAlign: "center", color: "red", marginTop: "10px" },
  link: { textAlign: "center", marginTop: "15px" },
};

export default Signup;