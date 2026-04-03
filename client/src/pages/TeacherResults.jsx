import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const TeacherResults = () => {
  const { examId } = useParams();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchResults = async () => {
    try {
      const response = await API.get(`/exams/${examId}/attempts`);
      console.log("Teacher exam attempts:", response.data);
      setAttempts(response.data || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to load results.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [examId]);

  if (loading) {
    return (
      <div className="teacher-page-shell">
        <section className="page-header teacher-hero">
          <div>
            <span className="teacher-kicker">Performance Overview</span>
            <h1 className="page-title">Exam Results</h1>
            <p className="page-subtitle">
              Review student attempts, scores, and submission activity for this
              exam.
            </p>
          </div>
        </section>

        <section className="teacher-page-section">
          <div className="panel teacher-empty-state p-8 text-center">
            <h2 className="section-title">Loading results</h2>
            <p className="section-subtitle">
              Fetching student attempts for this exam.
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="teacher-page-shell">
        <section className="page-header teacher-hero">
          <div>
            <span className="teacher-kicker">Performance Overview</span>
            <h1 className="page-title">Exam Results</h1>
            <p className="page-subtitle">
              Review student attempts, scores, and submission activity for this
              exam.
            </p>
          </div>
        </section>

        <section className="teacher-page-section">
          <div className="panel teacher-empty-state p-8 text-center">
            <h2 className="section-title">Unable to load results</h2>
            <p className="section-subtitle">{errorMessage}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="teacher-page-shell">
      <section className="page-header teacher-hero">
        <div>
          <span className="teacher-kicker">Performance Overview</span>
          <h1 className="page-title">Exam Results</h1>
          <p className="page-subtitle">
            Review student attempts, scores, and submission activity for this
            exam.
          </p>
        </div>

        <div className="teacher-badge-card">
          <p className="stat-label">Exam ID</p>
          <p className="teacher-badge-value">{examId}</p>
          <p className="section-subtitle">
            This page updates from the recorded attempts for the selected exam.
          </p>
        </div>
      </section>

      <section className="teacher-page-section">
        <div className="panel p-6">
          <div>
            <h2 className="section-title">Attempt records</h2>
            <p className="section-subtitle">
              Track who attempted this exam and when each submission was
              recorded.
            </p>
          </div>

          {attempts.length === 0 ? (
            <div className="panel teacher-empty-state mt-6 p-8 text-center">
              <h3 className="section-title">No attempts yet</h3>
              <p className="section-subtitle">
                No students have attempted this exam yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="teacher-results-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Score</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt._id}>
                      <td>{attempt.studentId?.name || "Unknown Student"}</td>
                      <td>{attempt.score ?? 0}</td>
                      <td>
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : "Not submitted yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TeacherResults;
