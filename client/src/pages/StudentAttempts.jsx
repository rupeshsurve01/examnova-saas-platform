import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentAttempts = () => {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAttempts = async () => {
    if (!user?.id) {
      setErrorMessage("Please log in again to view your attempts.");
      setLoading(false);
      return;
    }

    try {
      const response = await API.get(`/student/${user.id}/attempts`);
      setAttempts(response.data || []);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to fetch attempts.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="student-page-shell">
        <section className="page-header student-hero">
          <div>
            <span className="student-kicker">Attempt History</span>
            <h1 className="page-title">My Attempts</h1>
            <p className="page-subtitle">
              Review the exams you have attempted and the scores recorded so
              far.
            </p>
          </div>
        </section>

        <section className="student-page-section">
          <div className="panel p-8 text-center">
            <h2 className="section-title">Loading attempts</h2>
            <p className="section-subtitle">
              Fetching your exam attempt history.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="student-page-shell">
        <section className="page-header student-hero">
          <div>
            <span className="student-kicker">Attempt History</span>
            <h1 className="page-title">My Attempts</h1>
            <p className="page-subtitle">
              Review the exams you have attempted and the scores recorded so
              far.
            </p>
          </div>
        </section>

        <section className="student-page-section">
          <div className="panel p-8 text-center">
            <h2 className="section-title">Unable to load attempts</h2>
            <p className="section-subtitle">{errorMessage}</p>
          </div>
        </section>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="student-page-shell">
        <section className="page-header student-hero">
          <div>
            <span className="student-kicker">Attempt History</span>
            <h1 className="page-title">My Attempts</h1>
            <p className="page-subtitle">
              Review the exams you have attempted and the scores recorded so
              far.
            </p>
          </div>
        </section>

        <section className="student-page-section">
          <div className="panel p-8 text-center">
            <h2 className="section-title">No attempts yet</h2>
            <p className="section-subtitle">
              You have not attempted any exams yet. Once you complete an exam,
              it will appear here.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="student-page-shell">
      <section className="page-header student-hero">
        <div>
          <span className="student-kicker">Attempt History</span>
          <h1 className="page-title">My Attempts</h1>
          <p className="page-subtitle">
            Review the exams you have attempted and the scores recorded so far.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-box student-stat-box">
            <p className="stat-label">Attempted Exams</p>
            <p className="stat-value">{attempts.length}</p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Best Score</p>
            <p className="stat-value">
              {Math.max(...attempts.map((attempt) => Number(attempt.score) || 0))}
            </p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Latest Status</p>
            <p className="stat-value">Recorded</p>
          </div>
        </div>
      </section>

      <section className="student-page-section">
        <div className="exam-grid">
          {attempts.map((attempt) => (
            <article key={attempt._id} className="exam-card student-exam-card">
              <h2 className="section-title">
                {attempt.examId?.title || "Unknown Exam"}
              </h2>
              <p className="section-subtitle">
                Review your performance for this completed exam attempt.
              </p>

              <div className="exam-card-meta mt-5">
                <div className="meta-row">
                  <span>Exam Code</span>
                  <strong>{attempt.examId?.examCode || "No Code"}</strong>
                </div>
                <div className="meta-row">
                  <span>Duration</span>
                  <strong>
                    {attempt.examId?.duration
                      ? `${attempt.examId.duration} minutes`
                      : "N/A"}
                  </strong>
                </div>
                <div className="meta-row">
                  <span>Score</span>
                  <strong>{attempt.score ?? 0}</strong>
                </div>
                <div className="meta-row">
                  <span>Submitted At</span>
                  <strong>
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleString()
                      : "Not submitted yet"}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentAttempts;
