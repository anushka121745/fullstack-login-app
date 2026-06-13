import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState("employees");

  useEffect(() => {
    axios.get("https://ems-backend-kdk0.onrender.com/api/employees").then(res => setEmployees(res.data));
    axios.get("https://ems-backend-kdk0.onrender.com/api/leaves/all").then(res => setLeaves(res.data));
  }, []);

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Reports</h2>
        <Link to="/dashboard" style={styles.navBtn}>Dashboard</Link>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab("employees")} style={{ ...styles.tab, backgroundColor: activeTab === "employees" ? "#2196F3" : "#eee", color: activeTab === "employees" ? "white" : "black" }}>Employee Report</button>
        <button onClick={() => setActiveTab("leaves")} style={{ ...styles.tab, backgroundColor: activeTab === "leaves" ? "#2196F3" : "#eee", color: activeTab === "leaves" ? "white" : "black" }}>Leave Report</button>
      </div>

      {activeTab === "employees" && (
        <div>
          <div style={styles.exportBtns}>
            <button onClick={() => exportToExcel(employees, "employee_report")} style={styles.excelBtn}>Export Excel</button>
            <button onClick={() => exportToCSV(employees, "employee_report")} style={styles.csvBtn}>Export CSV</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} style={styles.tr}>
                  <td style={styles.td}>{emp.name}</td>
                  <td style={styles.td}>{emp.email}</td>
                  <td style={styles.td}>{emp.department_name}</td>
                  <td style={styles.td}>{emp.designation}</td>
                  <td style={styles.td}>{emp.phone}</td>
                  <td style={styles.td}>₹{emp.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "leaves" && (
        <div>
          <div style={styles.exportBtns}>
            <button onClick={() => exportToExcel(leaves, "leave_report")} style={styles.excelBtn}>Export Excel</button>
            <button onClick={() => exportToCSV(leaves, "leave_report")} style={styles.csvBtn}>Export CSV</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Leave Type</th>
                <th style={styles.th}>From</th>
                <th style={styles.th}>To</th>
                <th style={styles.th}>Days</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id} style={styles.tr}>
                  <td style={styles.td}>{leave.name}</td>
                  <td style={styles.td}>{leave.leave_name}</td>
                  <td style={styles.td}>{new Date(leave.from_date).toLocaleDateString()}</td>
                  <td style={styles.td}>{new Date(leave.to_date).toLocaleDateString()}</td>
                  <td style={styles.td}>{leave.total_days}</td>
                  <td style={styles.td}>
                    <span style={{ color: leave.status === "approved" ? "green" : leave.status === "rejected" ? "red" : "orange", fontWeight: "bold" }}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "15px 25px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  navBtn: { padding: "8px 16px", backgroundColor: "#2196F3", color: "white", borderRadius: "6px", textDecoration: "none" },
  tabs: { display: "flex", gap: "10px", marginBottom: "20px" },
  tab: { padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
  exportBtns: { display: "flex", gap: "10px", marginBottom: "15px" },
  excelBtn: { padding: "8px 16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  csvBtn: { padding: "8px 16px", backgroundColor: "#FF9800", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  thead: { backgroundColor: "#2196F3", color: "white" },
  th: { padding: "12px", textAlign: "center" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "10px", textAlign: "center" },
};

export default Reports;