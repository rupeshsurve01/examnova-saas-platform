import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTeacherExams = async () => {
      if (!user?.id) {
        setLoading(false);
        setErrorMessage("Please log in again to access your exams.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");
        const response = await API.get(`/exams/teacher/${user.id}`);
        setExams(response.data);
      } catch (error) {
        const message = error.response?.data?.message;

        if (message === "Exams Not Found") {
          setExams([]);
        } else {
          setErrorMessage(message || "Unable to load your created exams.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherExams();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCreateExam = () => {
    navigate("/exams");
  };

  const handleViewExam = (examId) => {
    navigate("/add-questions", { state: { examId } });
  };

  const recentExamCode =
    exams.find((exam) => exam.examCode)?.examCode || "Not assigned";

  return (
    <div className="app-shell teacher-shell">
      <div className="container-card teacher-dashboard-card mx-auto max-w-6xl overflow-hidden">
        <header className="topbar">
          <div>
            <div className="brand">ExamNova</div>
            <p className="text-sm text-[var(--muted)]">Teacher dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-[var(--muted)]">
              {user?.name ? `Logged in as ${user.name}` : "Logged in"}
            </div>
            <button onClick={handleLogout} className="secondary-button">
              Logout
            </button>
          </div>
        </header>

        <section className="page-header teacher-hero">
          <div>
            <span className="teacher-kicker">Control Center</span>
            <h1 className="page-title">Manage the exams your students will see</h1>
            <p className="page-subtitle">
              Review the exams you have created, jump into question authoring,
              and keep your assessment pipeline ready for publication.
            </p>
          </div>

          <div className="teacher-hero-actions">
            <button onClick={handleCreateExam} className="primary-button">
              Create New Exam
            </button>
            <div className="teacher-badge-card">
              <p className="stat-label">Latest Exam Code</p>
              <p className="teacher-badge-value">{recentExamCode}</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box teacher-stat-box">
              <p className="stat-label">Created Exams</p>
              <p className="stat-value">{exams.length}</p>
            </div>
            <div className="stat-box teacher-stat-box">
              <p className="stat-label">Role</p>
              <p className="stat-value">{user?.role || "Teacher"}</p>
            </div>
            <div className="stat-box teacher-stat-box">
              <p className="stat-label">Status</p>
              <p className="stat-value">{loading ? "Syncing" : "Ready"}</p>
            </div>
          </div>
        </section>

        <section className="p-6 pt-0">
          {errorMessage ? (
            <div className="panel teacher-empty-state p-8 text-center">
              <h2 className="section-title">Unable to load exams</h2>
              <p className="section-subtitle">{errorMessage}</p>
            </div>
          ) : loading ? (
            <div className="panel teacher-empty-state p-8 text-center">
              <h2 className="section-title">Loading your workspace</h2>
              <p className="section-subtitle">
                Fetching the exams you have created for your classes.
              </p>
            </div>
          ) : exams.length === 0 ? (
            <div className="panel teacher-empty-state p-8 text-center">
              <h2 className="section-title">No exams created yet</h2>
              <p className="section-subtitle">
                Start by creating your first exam and then add questions from
                the next screen.
              </p>
              <button
                onClick={handleCreateExam}
                className="primary-button teacher-empty-action"
              >
                Create Your First Exam
              </button>
            </div>
          ) : (
            <div className="exam-grid">
              {exams.map((exam) => (
                <article key={exam._id} className="exam-card teacher-exam-card">
                  <div className="teacher-card-top">
                    <div>
                      <h2 className="section-title">{exam.title}</h2>
                      <p className="section-subtitle">
                        {exam.description || "No description provided yet."}
                      </p>
                    </div>
                    <span className="teacher-code-pill">
                      {exam.examCode || "No code"}
                    </span>
                  </div>

                  <div className="exam-card-meta mt-5">
                    <div className="meta-row">
                      <span>Duration</span>
                      <strong>{exam.duration} minutes</strong>
                    </div>
                    <div className="meta-row">
                      <span>Total Marks</span>
                      <strong>{exam.totalMarks}</strong>
                    </div>
                    <div className="meta-row">
                      <span>Publish Status</span>
                      <strong>{exam.isPublished ? "Published" : "Draft"}</strong>
                    </div>
                  </div>

                  <div className="teacher-card-actions">
                    <button
                      onClick={() => handleViewExam(exam._id)}
                      className="primary-button"
                    >
                      Manage Questions
                    </button>
                    <button
                      onClick={handleCreateExam}
                      className="secondary-button"
                    >
                      Create Another
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
