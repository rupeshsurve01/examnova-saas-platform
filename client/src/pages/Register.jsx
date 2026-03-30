import { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);
      alert("Registration successful");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <section className="auth-side">
          <div className="brand">ExamNova</div>
          <div className="mt-8">
            <h1 className="page-title">Create Your Exam Account</h1>
            <p className="page-subtitle mt-3">
              Register as a student or teacher to access the online examination
              platform.
            </p>
          </div>

          <div className="stats-grid mt-8">
            <div className="stat-box">
              <p className="stat-label">Roles</p>
              <p className="stat-value">2</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Setup</p>
              <p className="stat-value">Quick</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Portal</p>
              <p className="stat-value">Secure</p>
            </div>
          </div>
        </section>

        <section className="auth-form-area">
          <h2 className="section-title">Register</h2>
          <p className="section-subtitle">
            Fill in your details to create a new account.
          </p>

          <form onSubmit={handleSubmit} className="form-grid mt-6">
            <div>
              <label className="field-label">Full Name</label>
              <input
                name="name"
                placeholder="Enter your full name"
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a password"
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="field-label">Role</label>
              <select
                name="role"
                onChange={handleChange}
                className="form-input"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <button type="submit" className="primary-button">
              Create Account
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-[var(--primary)]">
              Login here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Register;
