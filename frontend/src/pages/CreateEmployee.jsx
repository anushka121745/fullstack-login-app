import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function CreateEmployee() {
  const [form, setForm] = useState({ phone: "", address: "", designation: "", salary: "", department_id: "", });
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("https://ems-backend-kdk0.onrender.com/api/employees/departments").then(res => setDepartments(res.data));
    axios.get("https://ems-backend-kdk0.onrender.com/api/employees/skills").then(res => setSkills(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSkillToggle = (id) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const user_id = decoded.id;

      const res = await axios.post("https://ems-backend-kdk0.onrender.com/api/employees", {
        ...form, user_id, skills: selectedSkills
      });

      const empId = res.data.employee.id;

      if (images.length > 0) {
        const formData = new FormData();
        for (let img of images) formData.append("images", img);
        await axios.post(`https://ems-backend-kdk0.onrender.com/api/employees/upload/${empId}`, formData);
      }

      setMessage("Employee created successfully!");
      setTimeout(() => navigate("/employees"), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Create Employee</h2>
        <Link to="/employees" style={styles.navBtn}>Back to List</Link>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          <input style={styles.input} name="designation" placeholder="Designation" onChange={handleChange} required />
          <input style={styles.input} name="phone" placeholder="Phone" onChange={handleChange} required />
          <input style={styles.input} name="salary" placeholder="Salary" type="number" onChange={handleChange} required />
          <textarea style={styles.input} name="address" placeholder="Address" onChange={handleChange} required />

          <select style={styles.input} name="department_id" onChange={handleChange} required>
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>

          <div style={styles.skillsBox}>
            <p style={{ marginBottom: "8px" }}>Select Skills:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {skills.map(s => (
                <button type="button" key={s.id}
                  onClick={() => handleSkillToggle(s.id)}
                  style={{ ...styles.skillBtn, backgroundColor: selectedSkills.includes(s.id) ? "#2196F3" : "#eee", color: selectedSkills.includes(s.id) ? "white" : "black" }}>
                  {s.skill_name}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.uploadBox}>
            <p>Upload Images (max 5):</p>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} />
          </div>

          <button type="submit" style={styles.submitBtn}>Create Employee</button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "15px 25px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  navBtn: { padding: "8px 16px", backgroundColor: "#2196F3", color: "white", borderRadius: "6px", textDecoration: "none" },
  formCard: { backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", maxWidth: "600px", margin: "0 auto" },
  input: { width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "15px", boxSizing: "border-box" },
  skillsBox: { marginBottom: "12px" },
  skillBtn: { padding: "6px 12px", border: "none", borderRadius: "20px", cursor: "pointer" },
  uploadBox: { marginBottom: "12px" },
  submitBtn: { width: "100%", padding: "12px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer" },
  message: { textAlign: "center", color: "green", marginTop: "10px" },
};

export default CreateEmployee;
