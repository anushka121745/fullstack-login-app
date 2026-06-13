import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

function Reporting() {
  const [cityData, setCityData] = useState([]);
  const [domainData, setDomainData] = useState([]);
  const [meetingData, setMeetingData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [activeTab, setActiveTab] = useState("city");

  const COLORS = ["#2196F3", "#4CAF50", "#FF9800", "#f44336", "#9C27B0", "#00BCD4"];

  useEffect(() => {
    axios.get("http://localhost:5000/api/reporting/citywise").then(res => setCityData(res.data));
    axios.get("http://localhost:5000/api/reporting/domainwise").then(res => setDomainData(res.data));
    axios.get("http://localhost:5000/api/reporting/meetingmode").then(res => setMeetingData(res.data));
    axios.get("http://localhost:5000/api/reporting/salary-all").then(res => setSalaryData(res.data));
  }, []);

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h2 style={{ color: "white", margin: 0 }}>iSoftzone</h2>
          <p style={{ color: "#aaa", margin: 0, fontSize: "12px" }}>HRMS Platform</p>
        </div>
        <nav style={styles.nav}>
          <Link to="/dashboard" style={styles.navItem}>🏠 Dashboard</Link>
          <Link to="/employees" style={styles.navItem}>👥 Employees</Link>
          <Link to="/apply-leave" style={styles.navItem}>📅 Leave</Link>
          <Link to="/assets" style={styles.navItem}>💻 Assets</Link>
          <Link to="/reports" style={styles.navItem}>📊 Reports</Link>
          <Link to="/reporting" style={styles.navItemActive}>📈 Analytics</Link>
          <Link to="/leave-approval" style={styles.navItem}>✅ Approvals</Link>
        </nav>
      </div>

      <div style={styles.main}>
        <h2 style={styles.pageTitle}>📈 Advanced Reporting & Analytics</h2>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab("city")} style={{ ...styles.tab, backgroundColor: activeTab === "city" ? "#2196F3" : "#eee", color: activeTab === "city" ? "white" : "black" }}>City Wise</button>
          <button onClick={() => setActiveTab("domain")} style={{ ...styles.tab, backgroundColor: activeTab === "domain" ? "#2196F3" : "#eee", color: activeTab === "domain" ? "white" : "black" }}>Domain Wise</button>
          <button onClick={() => setActiveTab("meeting")} style={{ ...styles.tab, backgroundColor: activeTab === "meeting" ? "#2196F3" : "#eee", color: activeTab === "meeting" ? "white" : "black" }}>Meeting Mode</button>
          <button onClick={() => setActiveTab("salary")} style={{ ...styles.tab, backgroundColor: activeTab === "salary" ? "#2196F3" : "#eee", color: activeTab === "salary" ? "white" : "black" }}>Salary Report</button>
        </div>

        {activeTab === "city" && (
          <div>
            <div style={styles.chartRow}>
              <div style={styles.chartBox}>
                <h3>City Wise Employees</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_employees" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.chartBox}>
                <h3>City Wise Salary</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={cityData} dataKey="total_salary" nameKey="city" cx="50%" cy="50%" outerRadius={100} label>
                      {cityData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <button onClick={() => exportToExcel(cityData, "city_report")} style={styles.exportBtn}>Export Excel</button>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>Employees</th>
                  <th style={styles.th}>Avg Salary</th>
                  <th style={styles.th}>Total Salary</th>
                </tr>
              </thead>
              <tbody>
                {cityData.map((row, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{row.city}</td>
                    <td style={styles.td}>{row.total_employees}</td>
                    <td style={styles.td}>₹{Number(row.avg_salary).toLocaleString("en-IN")}</td>
                    <td style={styles.td}>₹{Number(row.total_salary).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "domain" && (
          <div>
            <div style={styles.chartRow}>
              <div style={styles.chartBox}>
                <h3>Domain Wise Employees</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={domainData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_employees" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={styles.chartBox}>
                <h3>Domain Wise Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={domainData} dataKey="total_employees" nameKey="domain" cx="50%" cy="50%" outerRadius={100} label>
                      {domainData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <button onClick={() => exportToExcel(domainData, "domain_report")} style={styles.exportBtn}>Export Excel</button>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Domain</th>
                  <th style={styles.th}>Employees</th>
                  <th style={styles.th}>Avg Salary</th>
                  <th style={styles.th}>Total Salary</th>
                </tr>
              </thead>
              <tbody>
                {domainData.map((row, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{row.domain}</td>
                    <td style={styles.td}>{row.total_employees}</td>
                    <td style={styles.td}>₹{Number(row.avg_salary).toLocaleString("en-IN")}</td>
                    <td style={styles.td}>₹{Number(row.total_salary).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "meeting" && (
          <div>
            <div style={styles.chartBox}>
              <h3>Meeting Mode Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={meetingData} dataKey="total_employees" nameKey="meeting_mode" cx="50%" cy="50%" outerRadius={120} label>
                    {meetingData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Meeting Mode</th>
                  <th style={styles.th}>Total Employees</th>
                </tr>
              </thead>
              <tbody>
                {meetingData.map((row, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{row.meeting_mode}</td>
                    <td style={styles.td}>{row.total_employees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "salary" && (
          <div>
            <div style={styles.chartBox}>
              <h3>Top 10 Salary Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="basic_salary" fill="#2196F3" name="Basic" />
                  <Bar dataKey="net_salary" fill="#4CAF50" name="Net" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button onClick={() => exportToExcel(salaryData, "salary_report")} style={styles.exportBtn}>Export Excel</button>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Designation</th>
                  <th style={styles.th}>Basic</th>
                  <th style={styles.th}>TDS</th>
                  <th style={styles.th}>ESI</th>
                  <th style={styles.th}>PF</th>
                  <th style={styles.th}>Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((row, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{row.name}</td>
                    <td style={styles.td}>{row.designation}</td>
                    <td style={styles.td}>₹{Number(row.basic_salary).toLocaleString("en-IN")}</td>
                    <td style={styles.td}>₹{Number(row.tds).toLocaleString("en-IN")}</td>
                    <td style={styles.td}>₹{Number(row.esi).toLocaleString("en-IN")}</td>
                    <td style={styles.td}>₹{Number(row.pf).toLocaleString("en-IN")}</td>
                    <td style={styles.td}><strong>₹{Number(row.net_salary).toLocaleString("en-IN")}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  main: { marginLeft: "220px", padding: "30px", flex: 1, backgroundColor: "#f5f6fa", minHeight: "100vh" },
  pageTitle: { color: "#333", marginBottom: "20px" },
  tabs: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  tab: { padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
  chartRow: { display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" },
  chartBox: { backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", flex: 1, minWidth: "300px", marginBottom: "20px" },
  exportBtn: { padding: "8px 16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginBottom: "15px" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  thead: { backgroundColor: "#2196F3", color: "white" },
  th: { padding: "12px", textAlign: "left" },
  tr: { borderBottom: "1px solid #f5f6fa" },
  td: { padding: "12px", color: "#333", fontSize: "14px" },
};

export default Reporting;