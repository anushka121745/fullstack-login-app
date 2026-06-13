import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ asset_code: "", asset_name: "", asset_type: "", purchase_date: "", purchase_cost: "" });
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("assets");

  useEffect(() => {
    fetchAssets();
    fetchAllocations();
    fetchUsers();
  }, []);

  const fetchAssets = () => {
    axios.get("https://ems-backend-kdk0.onrender.com/api/assets").then(res => setAssets(res.data));
  };

  const fetchAllocations = () => {
    axios.get("https://ems-backend-kdk0.onrender.com/api/assets/allocations").then(res => setAllocations(res.data));
  };

  const fetchUsers = () => {
    axios.get("https://ems-backend-kdk0.onrender.com/api/employees").then(res => setUsers(res.data));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://ems-backend-kdk0.onrender.com/api/assets", form);
      setMessage("Asset added successfully!");
      fetchAssets();
      setForm({ asset_code: "", asset_name: "", asset_type: "", purchase_date: "", purchase_cost: "" });
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const handleAllocate = async (asset_id, employee_id) => {
    try {
      const token = localStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      await axios.post("https://ems-backend-kdk0.onrender.com/api/assets/allocate", {
        asset_id, employee_id, allocated_by: decoded.id
      });
      setMessage("Asset allocated successfully!");
      fetchAssets();
      fetchAllocations();
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  const handleReturn = async (id, asset_id) => {
    try {
      const token = localStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      await axios.put(`https://ems-backend-kdk0.onrender.com/api/assets/return/${id}`, {
        asset_id, returned_by: decoded.id
      });
      setMessage("Asset returned successfully!");
      fetchAssets();
      fetchAllocations();
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Asset Management</h2>
        <Link to="/dashboard" style={styles.navBtn}>Dashboard</Link>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab("assets")} style={{ ...styles.tab, backgroundColor: activeTab === "assets" ? "#2196F3" : "#eee", color: activeTab === "assets" ? "white" : "black" }}>Assets List</button>
        <button onClick={() => setActiveTab("add")} style={{ ...styles.tab, backgroundColor: activeTab === "add" ? "#2196F3" : "#eee", color: activeTab === "add" ? "white" : "black" }}>Add Asset</button>
        <button onClick={() => setActiveTab("allocate")} style={{ ...styles.tab, backgroundColor: activeTab === "allocate" ? "#2196F3" : "#eee", color: activeTab === "allocate" ? "white" : "black" }}>Allocate Asset</button>
        <button onClick={() => setActiveTab("allocations")} style={{ ...styles.tab, backgroundColor: activeTab === "allocations" ? "#2196F3" : "#eee", color: activeTab === "allocations" ? "white" : "black" }}>Allocation History</button>
      </div>

      {activeTab === "assets" && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Cost</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(a => (
              <tr key={a.id} style={styles.tr}>
                <td style={styles.td}>{a.asset_code}</td>
                <td style={styles.td}>{a.asset_name}</td>
                <td style={styles.td}>{a.asset_type}</td>
                <td style={styles.td}>₹{a.purchase_cost}</td>
                <td style={styles.td}>
                  <span style={{ color: a.status === "available" ? "green" : "orange", fontWeight: "bold" }}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === "add" && (
        <div style={styles.formCard}>
          <form onSubmit={handleAddAsset}>
            <input style={styles.input} name="asset_code" placeholder="Asset Code (e.g. LT002)" value={form.asset_code} onChange={handleChange} required />
            <input style={styles.input} name="asset_name" placeholder="Asset Name" value={form.asset_name} onChange={handleChange} required />
            <input style={styles.input} name="asset_type" placeholder="Asset Type (Laptop/Monitor/etc)" value={form.asset_type} onChange={handleChange} required />
            <input style={styles.input} name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} required />
            <input style={styles.input} name="purchase_cost" placeholder="Purchase Cost" type="number" value={form.purchase_cost} onChange={handleChange} required />
            <button type="submit" style={styles.submitBtn}>Add Asset</button>
          </form>
        </div>
      )}

      {activeTab === "allocate" && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Asset</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Allocate To</th>
            </tr>
          </thead>
          <tbody>
            {assets.filter(a => a.status === "available").map(a => (
              <tr key={a.id} style={styles.tr}>
                <td style={styles.td}>{a.asset_name}</td>
                <td style={styles.td}>{a.asset_type}</td>
                <td style={styles.td}><span style={{ color: "green" }}>Available</span></td>
                <td style={styles.td}>
                  <select style={styles.select} onChange={(e) => e.target.value && handleAllocate(a.id, e.target.value)}>
                    <option value="">Select Employee</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === "allocations" && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Asset</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map(a => (
              <tr key={a.id} style={styles.tr}>
                <td style={styles.td}>{a.asset_name}</td>
                <td style={styles.td}>{a.asset_type}</td>
                <td style={styles.td}>{a.employee_name}</td>
                <td style={styles.td}>{new Date(a.allocated_date).toLocaleDateString()}</td>
                <td style={styles.td}>{a.status}</td>
                <td style={styles.td}>
                  {a.status === "allocated" && (
                    <button onClick={() => handleReturn(a.id, a.asset_id)} style={styles.returnBtn}>Return</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  thead: { backgroundColor: "#2196F3", color: "white" },
  th: { padding: "12px", textAlign: "center" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "10px", textAlign: "center" },
  formCard: { backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", maxWidth: "600px" },
  input: { width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "15px", boxSizing: "border-box" },
  select: { padding: "6px", borderRadius: "4px", border: "1px solid #ccc" },
  submitBtn: { width: "100%", padding: "12px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
  returnBtn: { padding: "5px 10px", backgroundColor: "#FF9800", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  message: { textAlign: "center", color: "green", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "6px", marginBottom: "15px" },
};

export default Assets;