import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { token, password }
      );
      setMessage(res.data.message);
      alert("Password reset successful! Please login.");
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reset Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={styles.button}>Reset Password</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: "400px", margin: "60px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", fontFamily: "Arial, sans-serif" },
  title: { textAlign: "center", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px 14px", fontSize: "15px", border: "1px solid #ccc", borderRadius: "6px" },
  button: { padding: "10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
  message: { textAlign: "center", color: "green", marginTop: "10px" },
};

export default ResetPassword;