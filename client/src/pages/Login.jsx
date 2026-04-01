import { useState } from "react";
import API from "../services/api";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const getDashboardPath = (role) =>
    role === "teacher" || role === "org_admin" ? "/teacher" : "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", { email, password });
      login({ user: res.data.user, token: res.data.token });
      alert("Login Successful");
      navigate(getDashboardPath(res.data.user?.role));
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <section className="auth-side">
          <div className="brand">ExamNova</div>
          <div className="mt-8">
            <h1 className="page-title">Student Examination Portal</h1>
            <p className="page-subtitle mt-3">
              Sign in to view available exams, continue attempts, and submit
              your answers securely.
            </p>
          </div>

          <div className="stats-grid mt-8">
            <div className="stat-box">
              <p className="stat-label">Access</p>
              <p className="stat-value">24/7</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Mode</p>
              <p className="stat-value">Online</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Status</p>
              <p className="stat-value">Active</p>
            </div>
          </div>
        </section>

        <section className="auth-form-area">
          <h2 className="section-title">Login</h2>
          <p className="section-subtitle">
            Enter your registered email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="form-grid mt-6">
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="primary-button">
              Login
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--primary)]"
            >
              Register here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;
