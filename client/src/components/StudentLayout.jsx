import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="student-layout">
      <header className="student-navbar">
        <div className="student-navbar-brand">
          <div className="brand">ExamNova</div>
          <p className="student-navbar-subtitle">Student workspace</p>
        </div>

        <nav className="student-navbar-nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `student-nav-link${isActive ? " student-nav-link-active" : ""}`
            }
          >
            Dashboard
          </NavLink>
        </nav>

        <div className="student-navbar-actions">
          <div className="student-navbar-user">
            <p className="stat-label">Signed in</p>
            <p className="student-navbar-name">
              {user?.name || "Student portal"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="secondary-button"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="student-content">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
