import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const startExam = async (examId) => {
    try {
      if (!user?.id) {
        alert("Please login again to start the exam.");
        logout();
        navigate("/");
        return;
      }

      await API.post(`/exams/${examId}/start`);
      navigate(`/exam/${examId}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to start the exam";

      if (message === "Exam already started") {
        navigate(`/exam/${examId}`);
        return;
      }
      alert(message);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="app-shell">
      <div className="container-card mx-auto max-w-6xl overflow-hidden">
        <header className="topbar">
          <div>
            <div className="brand">ExamNova</div>
            <p className="text-sm text-[var(--muted)]">Student dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-[var(--muted)]">
              {user?.name ? `Logged in as ${user.name}` : "Logged in"}
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="secondary-button"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="page-header">
          <div>
            <h1 className="page-title">Available Exams</h1>
            <p className="page-subtitle">
              View all published exams and start your attempt from this page.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <p className="stat-label">Published Exams</p>
              <p className="stat-value">{exams.length}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Candidate</p>
              <p className="stat-value">{user?.role || "Student"}</p>
            </div>
            <div className="stat-box">
              <p className="stat-label">Portal Status</p>
              <p className="stat-value">Ready</p>
            </div>
          </div>
        </section>

        <section className="p-6 pt-0">
          {exams.length === 0 ? (
            <div className="panel p-8 text-center">
              <h2 className="section-title">No exams available</h2>
              <p className="section-subtitle">
                Published exams will appear here once they are created by a
                teacher.
              </p>
            </div>
          ) : (
            <div className="exam-grid">
              {exams.map((exam) => (
                <article key={exam._id} className="exam-card">
                  <h2 className="section-title">{exam.title}</h2>
                  <p className="section-subtitle">{exam.description}</p>

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
                      <span>Exam Code</span>
                      <strong>{exam.examCode || "N/A"}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => startExam(exam._id)}
                    className="primary-button mt-6 w-full"
                  >
                    Start Exam
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentDashboard;
