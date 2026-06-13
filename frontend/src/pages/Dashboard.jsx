import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [leaveStats, setLeaveStats] = useState({});
  const [assetStats, setAssetStats] = useState({});
  const [deptStats, setDeptStats] = useState([]);
  const [totalSalary, setTotalSalary] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("https://ems-backend-kdk0.onrender.com/api/user/profile", { headers: { Authorization: token } })
      .then(res => setUser(res.data))
      .catch(() => navigate("/"));

    axios.get("https://ems-backend-kdk0.onrender.com/api/employees/stats/dashboard").then(res => setStats(res.data));
    axios.get("https://ems-backend-kdk0.onrender.com/api/leaves/stats").then(res => setLeaveStats(res.data));
    axios.get("https://ems-backend-kdk0.onrender.com/api/assets/stats").then(res => setAssetStats(res.data));
    axios.get("https://ems-backend-kdk0.onrender.com/api/employees/department-stats").then(res => setDeptStats(res.data));
    axios.get("https://ems-backend-kdk0.onrender.com/api/employees/total-salary").then(res => setTotalSalary(res.data.total));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h2>;

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h2 style={{ color: "white", margin: 0 }}>iSoftzone</h2>
          <p style={{ color: "#aaa", margin: 0, fontSize: "12px" }}>HRMS Platform</p>
        </div>

        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navItemActive}>🏠 Dashboard</Link>
          <Link to="/employees" style={styles.navItem}>👥 Employees</Link>
          <Link to="/apply-leave" style={styles.navItem}>📅 Leave</Link>
          <Link to="/assets" style={styles.navItem}>💻 Assets</Link>
          <Link to="/reports" style={styles.navItem}>📊 Reports</Link>
          <Link to="/leave-approval" style={styles.navItem}>✅ Approvals</Link>
          <Link to="/reporting" style={styles.navItem}>📈 Analytics</Link>
        </nav>

        <div style={styles.userBox}>
          <div style={styles.avatar}>{user.name.charAt(0)}</div>
          <div>
            <p style={{ color: "white", margin: 0, fontSize: "14px" }}>{user.name}</p>
            <p style={{ color: "#aaa", margin: 0, fontSize: "12px" }}>{user.role || "Employee"}</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>⏻</button>
        </div>
      </div>

      <div style={styles.main}>
        <h2 style={styles.pageTitle}>Dashboard</h2>

        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#e3f2fd" }}>👥</div>
            <div>
              <p style={styles.cardLabel}>TOTAL EMPLOYEES</p>
              <h2 style={styles.cardValue}>{stats.employees || 0}</h2>
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#e8f5e9" }}>🏢</div>
            <div>
              <p style={styles.cardLabel}>DEPARTMENTS</p>
              <h2 style={styles.cardValue}>{stats.departments || 0}</h2>
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#fff8e1" }}>⏳</div>
            <div>
              <p style={styles.cardLabel}>PENDING LEAVES</p>
              <h2 style={styles.cardValue}>{leaveStats.pending || 0}</h2>
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#e8f5e9" }}>✅</div>
            <div>
              <p style={styles.cardLabel}>APPROVED LEAVES</p>
              <h2 style={styles.cardValue}>{leaveStats.approved || 0}</h2>
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#ffebee" }}>❌</div>
            <div>
              <p style={styles.cardLabel}>REJECTED LEAVES</p>
              <h2 style={styles.cardValue}>{leaveStats.rejected || 0}</h2>
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#e3f2fd" }}>💻</div>
            <div>
              <p style={styles.cardLabel}>TOTAL ASSETS</p>
              <h2 style={styles.cardValue}>{assetStats.total || 0}</h2>
            </div>
          </div>
          <div style={{ ...styles.card, gridColumn: "span 2" }}>
            <div style={{ ...styles.cardIcon, backgroundColor: "#fff8e1" }}>💰</div>
            <div>
              <p style={styles.cardLabel}>TOTAL SALARY EXPENSE</p>
              <h2 style={{ ...styles.cardValue, color: "#f57c00" }}>₹{Number(totalSalary).toLocaleString("en-IN")}</h2>
            </div>
          </div>
        </div>

        <div style={styles.tableBox}>
          <h3 style={styles.tableTitle}>🏢 Department Statistics</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>DEPARTMENT</th>
                <th style={styles.th}>EMPLOYEES</th>
                <th style={styles.th}>AVG SALARY</th>
                <th style={styles.th}>TOTAL SALARY</th>
              </tr>
            </thead>
            <tbody>
              {deptStats.map((dept, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.deptBadge}>{dept.department_name}</span>
                  </td>
                  <td style={styles.td}>{dept.employee_count}</td>
                  <td style={styles.td}>₹{Number(dept.avg_salary).toLocaleString("en-IN")}</td>
                  <td style={styles.td}>₹{Number(dept.total_salary).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar: { width: "220px", backgroundColor: "#1a1f36", display: "flex", flexDirection: "column", padding: "20px", position: "fixed", height: "100vh", left: 0, top: 0, overflowY: "auto" },
  logo: { marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #333" },
  nav: { display: "flex", flexDirection: "column", gap: "5px", flex: 1 },
  navItem: { padding: "12px 15px", color: "#aaa", textDecoration: "none", borderRadius: "8px", fontSize: "14px" },
  navItemActive: { padding: "12px 15px", color: "white", textDecoration: "none", borderRadius: "8px", fontSize: "14px", backgroundColor: "#2196F3" },
  userBox: { display: "flex", alignItems: "center", gap: "10px", paddingTop: "20px", borderTop: "1px solid #333" },
  avatar: { width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "#2196F3", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  logoutBtn: { marginLeft: "auto", background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" },
  main: { marginLeft: "220px", padding: "30px", flex: 1, backgroundColor: "#f5f6fa", minHeight: "100vh", overflowY: "auto" },
  pageTitle: { color: "#333", marginBottom: "20px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" },
  card: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: "15px" },
  cardIcon: { width: "50px", height: "50px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" },
  cardLabel: { color: "#999", fontSize: "11px", margin: 0, fontWeight: "bold" },
  cardValue: { color: "#333", margin: 0, fontSize: "28px" },
  tableBox: { backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  tableTitle: { color: "#333", marginBottom: "15px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f5f6fa" },
  th: { padding: "12px", textAlign: "left", color: "#999", fontSize: "12px", fontWeight: "bold" },
  tr: { borderBottom: "1px solid #f5f6fa" },
  td: { padding: "12px", color: "#333", fontSize: "14px" },
  deptBadge: { backgroundColor: "#e3f2fd", color: "#1976d2", padding: "4px 10px", borderRadius: "20px", fontSize: "13px" },
};

export default Dashboard;