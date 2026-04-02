import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/teacher", label: "Dashboard", end: true },
  { to: "/exams", label: "Create Exam" },
  { to: "/add-questions", label: "Question Bank" },
];

function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="teacher-layout">
      <aside className="teacher-sidebar">
        <div className="teacher-sidebar-header">
          <div className="brand">ExamNova</div>
          <p className="teacher-sidebar-subtitle">Teacher control center</p>
        </div>

        <div className="teacher-sidebar-profile">
          <p className="stat-label">Logged in as</p>
          <p className="teacher-sidebar-name">
            {user?.name || "Teacher workspace"}
          </p>
          <p className="teacher-sidebar-role">{user?.role || "teacher"}</p>
        </div>

        <nav className="teacher-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `teacher-nav-link${isActive ? " teacher-nav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="teacher-sidebar-footer">
          <button
            type="button"
            onClick={() => navigate("/exams")}
            className="primary-button teacher-sidebar-action"
          >
            New Exam
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="secondary-button"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="teacher-content">
        <Outlet />
      </main>
    </div>
  );
}

export default TeacherLayout;
