import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [leaveStats, setLeaveStats] = useState({});
  const [assetStats, setAssetStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/api/user/profile", { headers: { Authorization: token } })
      .then(res => setUser(res.data))
      .catch(() => navigate("/"));

    axios.get("http://localhost:5000/api/employees/stats/dashboard")
      .then(res => setStats(res.data));

    axios.get("http://localhost:5000/api/leaves/stats")
      .then(res => setLeaveStats(res.data));

    axios.get("http://localhost:5000/api/assets/stats")
      .then(res => setAssetStats(res.data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  const leaveChartData = [
    { name: "Pending", value: parseInt(leaveStats.pending || 0) },
    { name: "Approved", value: parseInt(leaveStats.approved || 0) },
    { name: "Rejected", value: parseInt(leaveStats.rejected || 0) },
  ];

  const assetChartData = [
    { name: "Available", value: parseInt(assetStats.available || 0) },
    { name: "Allocated", value: parseInt(assetStats.allocated || 0) },
  ];

  const COLORS = ["#FF9800", "#4CAF50", "#f44336", "#2196F3"];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Welcome, {user.name}! 👋</h1>
        <div style={styles.navLinks}>
          <Link to="/employees" style={styles.navBtn}>Employees</Link>
          <Link to="/create-employee" style={styles.navBtn}>Add Employee</Link>
          <Link to="/apply-leave" style={styles.navBtn}>Apply Leave</Link>
          <Link to="/my-leaves" style={styles.navBtn}>My Leaves</Link>
          <Link to="/leave-approval" style={styles.navBtn}>Approvals</Link>
          <Link to="/assets" style={styles.navBtn}>Assets</Link>
          <Link to="/reports" style={styles.navBtn}>Reports</Link>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Employee Stats</h3>
      <div style={styles.cards}>
        <div style={styles.card}><h2>{stats.employees || 0}</h2><p>Total Employees</p></div>
        <div style={styles.card}><h2>{stats.departments || 0}</h2><p>Departments</p></div>
        <div style={styles.card}><h2>{stats.skills || 0}</h2><p>Skills</p></div>
        <div style={styles.card}><h2>{assetStats.total || 0}</h2><p>Total Assets</p></div>
      </div>

      <h3 style={styles.sectionTitle}>Leave Stats</h3>
      <div style={styles.cards}>
        <div style={{ ...styles.card, borderTop: "4px solid #2196F3" }}><h2>{leaveStats.total || 0}</h2><p>Total Leaves</p></div>
        <div style={{ ...styles.card, borderTop: "4px solid orange" }}><h2>{leaveStats.pending || 0}</h2><p>Pending</p></div>
        <div style={{ ...styles.card, borderTop: "4px solid green" }}><h2>{leaveStats.approved || 0}</h2><p>Approved</p></div>
        <div style={{ ...styles.card, borderTop: "4px solid red" }}><h2>{leaveStats.rejected || 0}</h2><p>Rejected</p></div>
      </div>

      <h3 style={styles.sectionTitle}>Charts</h3>
      <div style={styles.charts}>
        <div style={styles.chartBox}>
          <h4>Leave Status</h4>
          <PieChart width={300} height={250}>
            <Pie data={leaveChartData} cx={150} cy={100} outerRadius={80} dataKey="value" label>
              {leaveChartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </div>

        <div style={styles.chartBox}>
          <h4>Asset Status</h4>
          <BarChart width={300} height={250} data={assetChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2196F3" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "15px 25px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", flexWrap: "wrap", gap: "10px" },
  navLinks: { display: "flex", flexWrap: "wrap", gap: "8px" },
  navBtn: { padding: "8px 16px", backgroundColor: "#2196F3", color: "white", borderRadius: "6px", textDecoration: "none" },
  logoutBtn: { padding: "8px 16px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  sectionTitle: { color: "#444", marginBottom: "15px", marginTop: "20px" },
  cards: { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" },
  card: { backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", flex: "1", textAlign: "center", minWidth: "150px" },
  charts: { display: "flex", gap: "20px", flexWrap: "wrap" },
  chartBox: { backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
};

export default Dashboard;