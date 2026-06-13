import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function LeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("https://ems-backend-kdk0.onrender.com/api/leaves/all")
    .then(res => setLeaves(res.data))
    .catch(err => console.log(err));
  }, []);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const approved_by = decoded.id;

      await axios.put(`https://ems-backend-kdk0.onrender.com/api/leaves/action/${id}`, {
        action, remarks: action, approved_by
      });

      setMessage(`Leave ${action} successfully!`);
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: action } : l));
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "green";
    if (status === "rejected") return "red";
    return "orange";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Leave Approval Panel</h2>
        <Link to="/dashboard" style={styles.navBtn}>Dashboard</Link>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th style={styles.th}>Employee</th>
            <th style={styles.th}>Leave Type</th>
            <th style={styles.th}>From</th>
            <th style={styles.th}>To</th>
            <th style={styles.th}>Days</th>
            <th style={styles.th}>Reason</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
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
              <td style={styles.td}>{leave.reason}</td>
              <td style={styles.td}>
                <span style={{ color: getStatusColor(leave.status), fontWeight: "bold", textTransform: "capitalize" }}>
                  {leave.status}
                </span>
              </td>
              <td style={styles.td}>
                {leave.status === "pending" && (
                  <div>
                    <button onClick={() => handleAction(leave.id, "approved")} style={styles.approveBtn}>Approve</button>
                    <button onClick={() => handleAction(leave.id, "rejected")} style={styles.rejectBtn}>Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {leaves.length === 0 && <p style={{ textAlign: "center", marginTop: "20px" }}>No leave applications found!</p>}
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "15px 25px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  navBtn: { padding: "8px 16px", backgroundColor: "#2196F3", color: "white", borderRadius: "6px", textDecoration: "none" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  thead: { backgroundColor: "#2196F3", color: "white" },
  th: { padding: "12px", textAlign: "center" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "10px", textAlign: "center" },
  approveBtn: { padding: "5px 10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px" },
  rejectBtn: { padding: "5px 10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  message: { textAlign: "center", color: "green", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "6px", marginBottom: "15px" },
};

export default LeaveApproval;