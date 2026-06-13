import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("https://ems-backend-kdk0.onrender.com/api/employees")
    .then(res => setEmployees(res.data))
    .catch(err => console.log(err));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      await axios.delete(`https://ems-backend-kdk0.onrender.com/api/employees/${id}`);
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Employee List</h2>
        <div>
          <Link to="/dashboard" style={styles.navBtn}>Dashboard</Link>
          <Link to="/create-employee" style={styles.addBtn}>+ Add Employee</Link>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.thead}>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Phone</th>
            <th>Salary</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id} style={styles.tr}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department_name}</td>
              <td>{emp.designation}</td>
              <td>{emp.phone}</td>
              <td>{emp.salary}</td>
              <td>
                <button onClick={() => handleDelete(emp.id)} style={styles.deleteBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {employees.length === 0 && <p style={{ textAlign: "center", marginTop: "20px" }}>No employees found!</p>}
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "15px 25px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  navBtn: { padding: "8px 16px", backgroundColor: "#2196F3", color: "white", borderRadius: "6px", textDecoration: "none", marginRight: "10px" },
  addBtn: { padding: "8px 16px", backgroundColor: "#4CAF50", color: "white", borderRadius: "6px", textDecoration: "none" },
  table: { width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  thead: { backgroundColor: "#2196F3", color: "white" },
  tr: { borderBottom: "1px solid #eee", textAlign: "center", padding: "10px" },
  deleteBtn: { padding: "5px 10px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
};

export default EmployeeList;