import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/teacher", label: "Dashboard", end: true },
  { to: "/exams", label: "Create Exam" },
  { to: "/add-questions", label: "Question Bank" },
  { to: "/teacher/archived", label: "Archived Exams" },
];

function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="teacher-layout">
      <header className="teacher-mobile-topbar">
        <div>
          <div className="brand">ExamNova</div>
          <p className="teacher-sidebar-subtitle">Teacher control center</p>
        </div>
        <button
          type="button"
          className="teacher-mobile-menu-button"
          onClick={() => setIsSidebarOpen((current) => !current)}
          aria-label="Toggle teacher navigation"
        >
          {isSidebarOpen ? "Close" : "Menu"}
        </button>
      </header>

      {isSidebarOpen ? (
        <button
          type="button"
          className="teacher-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu backdrop"
        />
      ) : null}

      <aside className={`teacher-sidebar ${isSidebarOpen ? "teacher-sidebar-open" : ""}`}>
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
              onClick={() => setIsSidebarOpen(false)}
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
            onClick={() => handleNavigate("/exams")}
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
