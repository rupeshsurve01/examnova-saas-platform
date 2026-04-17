import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ArchivedExams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [restoringExamId, setRestoringExamId] = useState(null);

  const fetchArchivedExams = async () => {
    if (!user?.id) {
      setLoading(false);
      setErrorMessage("Please log in again to access archived exams.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const response = await API.get(`/exams/teacher/${user.id}/archived`);
      setExams(response.data || []);
    } catch (error) {
      const message = error.response?.data?.message;
      if (message === "Archived exams not found") {
        setExams([]);
        return;
      }
      setErrorMessage(message || "Unable to load archived exams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedExams();
  }, [user?.id]);

  const handleRestoreExam = async (exam) => {
    const confirmed = window.confirm(
      `Restore "${exam.title}" to your active exams list?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setRestoringExamId(exam._id);
      await API.patch(`/exams/${exam._id}/restore`);
      setExams((currentExams) =>
        currentExams.filter((currentExam) => currentExam._id !== exam._id),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Unable to restore this exam.");
    } finally {
      setRestoringExamId(null);
    }
  };

  return (
    <div className="teacher-page-shell">
      <section className="page-header teacher-hero">
        <div>
          <span className="teacher-kicker">Archive Manager</span>
          <h1 className="page-title">Archived Exams</h1>
          <p className="page-subtitle">
            Restore previously archived exams back into your active workspace
            whenever you need them again.
          </p>
        </div>

        <div className="teacher-badge-card">
          <p className="stat-label">Archived Exams</p>
          <p className="teacher-badge-value">{exams.length}</p>
          <p className="section-subtitle">
            Archived exams remain hidden from students until you restore and
            publish them again.
          </p>
        </div>

        <div className="teacher-hero-actions">
          <button
            type="button"
            onClick={() => navigate("/teacher")}
            className="secondary-button"
          >
            Back to Dashboard
          </button>
        </div>
      </section>

      <section className="teacher-page-section">
        {errorMessage ? (
          <div className="panel teacher-empty-state p-8 text-center">
            <h2 className="section-title">Unable to load archived exams</h2>
            <p className="section-subtitle">{errorMessage}</p>
          </div>
        ) : loading ? (
          <div className="panel teacher-empty-state p-8 text-center">
            <h2 className="section-title">Loading archived exams</h2>
            <p className="section-subtitle">
              Fetching archived records from your workspace.
            </p>
          </div>
        ) : exams.length === 0 ? (
          <div className="panel teacher-empty-state p-8 text-center">
            <h2 className="section-title">No archived exams</h2>
            <p className="section-subtitle">
              Archive exams from your dashboard and they will appear here for
              restore actions.
            </p>
          </div>
        ) : (
          <div className="exam-grid">
            {exams.map((exam) => (
              <article key={exam._id} className="exam-card teacher-exam-card">
                <div className="teacher-card-top">
                  <div>
                    <h2 className="section-title">{exam.title}</h2>
                    <p className="section-subtitle">
                      {exam.description || "No description available."}
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
                    <span>Recorded Attempts</span>
                    <strong>{exam.attemptsCount || 0}</strong>
                  </div>
                </div>

                <div className="teacher-card-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleRestoreExam(exam)}
                    disabled={restoringExamId === exam._id}
                  >
                    {restoringExamId === exam._id
                      ? "Restoring..."
                      : "Restore Exam"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ArchivedExams;
