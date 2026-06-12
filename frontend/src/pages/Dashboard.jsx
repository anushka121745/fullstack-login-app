import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [leaveStats, setLeaveStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("http://localhost:5000/api/user/profile", {
      headers: { Authorization: token }
    })
    .then(res => setUser(res.data))
    .catch(() => navigate("/"));

    axios.get("http://localhost:5000/api/employees/stats/dashboard")
    .then(res => setStats(res.data))
    .catch(err => console.log(err));

    axios.get("http://localhost:5000/api/leaves/stats")
    .then(res => setLeaveStats(res.data))
    .catch(err => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Welcome, {user.name}! 👋</h1>
        <div>
          <Link to="/employees" style={styles.navBtn}>Employees</Link>
          <Link to="/create-employee" style={styles.navBtn}>Add Employee</Link>
          <Link to="/apply-leave" style={styles.navBtn}>Apply Leave</Link>
          <Link to="/my-leaves" style={styles.navBtn}>My Leaves</Link>
          <Link to="/leave-approval" style={styles.navBtn}>Approvals</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Employee Stats</h3>
      <div style={styles.cards}>
        <div style={styles.card}>
          <h2>{stats.employees || 0}</h2>
          <p>Total Employees</p>
        </div>
        <div style={styles.card}>
          <h2>{stats.departments || 0}</h2>
          <p>Total Departments</p>
        </div>
        <div style={styles.card}>
          <h2>{stats.skills || 0}</h2>
          <p>Total Skills</p>
        </div>
        <div style={styles.card}>
          <h2>{stats.images || 0}</h2>
          <p>Total Images</p>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Leave Stats</h3>
      <div style={styles.cards}>
        <div style={{ ...styles.card, borderTop: "4px solid #2196F3" }}>
          <h2>{leaveStats.total || 0}</h2>
          <p>Total Leaves</p>
        </div>
        <div style={{ ...styles.card, borderTop: "4px solid orange" }}>
          <h2>{leaveStats.pending || 0}</h2>
          <p>Pending</p>
        </div>
        <div style={{ ...styles.card, borderTop: "4px solid green" }}>
          <h2>{leaveStats.approved || 0}</h2>
          <p>Approved</p>
        </div>
        <div style={{ ...styles.card, borderTop: "4px solid red" }}>
          <h2>{leaveStats.rejected || 0}</h2>
          <p>Rejected</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "15px 25px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", flexWrap: "wrap", gap: "10px" },
  navBtn: { padding: "8px 16px", backgroundColor: "#2196F3", color: "white", borderRadius: "6px", textDecoration: "none", marginRight: "10px" },
  logoutBtn: { padding: "8px 16px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  sectionTitle: { color: "#444", marginBottom: "15px", marginTop: "20px" },
  cards: { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" },
  card: { backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", flex: "1", textAlign: "center", minWidth: "150px" },
};

export default Dashboard;