import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function ApplyLeave() {
  const [form, setForm] = useState({ leave_type_id: "", from_date: "", to_date: "", reason: "" });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/leaves/types")
    .then(res => setLeaveTypes(res.data))
    .catch(err => console.log(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const employee_id = decoded.id;

      await axios.post("http://localhost:5000/api/leaves/apply", {
        ...form, employee_id
      });

      setMessage("Leave applied successfully!");
      setTimeout(() => navigate("/my-leaves"), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Apply for Leave</h2>
        <div>
          <Link to="/dashboard" style={styles.navBtn}>Dashboard</Link>
          <Link to="/my-leaves" style={styles.navBtn}>My Leaves</Link>
        </div>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <select style={styles.input} name="leave_type_id" onChange={handleChange} required>
            <option value="">Select Leave Type</option>
            {leaveTypes.map(lt => (
              <option key={lt.id} value={lt.id}>{lt.leave_name} ({lt.total_days} days)</option>
            ))}
          </select>

          <label style={styles.label}>From Date:</label>
          <input style={styles.input} type="date" name="from_date" onChange={handleChange} required />

          <label style={styles.label}>To Date:</label>
          <input style={styles.input} type="date" name="to_date" onChange={handleChange} required />

          <textarea style={styles.input} name="reason" placeholder="Reason for leave" rows="4" onChange={handleChange} required />

          <button type="submit" style={styles.submitBtn}>Apply Leave</button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "15px 25px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  navBtn: { padding: "8px 16px", backgroundColor: "#2196F3", color: "white", borderRadius: "6px", textDecoration: "none", marginRight: "10px" },
  formCard: { backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", maxWidth: "600px", margin: "0 auto" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold", color: "#555" },
  input: { width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "15px", boxSizing: "border-box" },
  submitBtn: { width: "100%", padding: "12px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
  message: { textAlign: "center", color: "green", marginTop: "10px" },
};

export default ApplyLeave;