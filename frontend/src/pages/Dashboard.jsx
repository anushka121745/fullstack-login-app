import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("http://localhost:5000/api/user/profile", {
      headers: { Authorization: token }
    })
    .then(res => setUser(res.data))
    .catch(() => navigate("/"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={styles.container}>
      <h1 style={styles.welcome}>Welcome, {user.name}! 👋</h1>

      <div style={styles.card}>
        <h2 style={styles.title}>Your Profile</h2>
        <p style={styles.info}><strong>Name:</strong> {user.name}</p>
        <p style={styles.info}><strong>Email:</strong> {user.email}</p>
        <p style={styles.info}><strong>Role:</strong> {user.role || "user"}</p>
      </div>

      <button onClick={handleLogout} style={styles.button}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: { maxWidth: "500px", margin: "60px auto", fontFamily: "Arial, sans-serif", textAlign: "center" },
  welcome: { color: "#333" },
  card: { padding: "30px", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginBottom: "20px" },
  title: { color: "#444", marginBottom: "20px" },
  info: { fontSize: "16px", color: "#555", marginBottom: "10px", textAlign: "left" },
  button: { padding: "10px 30px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
};

export default Dashboard;