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

  const totalAttempts = attempts.length;
  const highestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => Number(attempt.score) || 0))
      : 0;
  const averageScore =
    attempts.length > 0
      ? (
          attempts.reduce(
            (sum, attempt) => sum + (Number(attempt.score) || 0),
            0,
          ) / attempts.length
        ).toFixed(1)
      : "0.0";
  const latestSubmission = attempts.reduce((latest, attempt) => {
    if (!attempt.submittedAt) {
      return latest;
    }

    const submittedTime = new Date(attempt.submittedAt).getTime();
    return submittedTime > latest ? submittedTime : latest;
  }, 0);
  const studentAnalytics = Object.values(
    attempts.reduce((analytics, attempt) => {
      const studentId = attempt.studentId?._id || `unknown-${attempt._id}`;
      const studentName = attempt.studentId?.name || "Unknown Student";
      const score = Number(attempt.score) || 0;
      const submittedTime = attempt.submittedAt
        ? new Date(attempt.submittedAt).getTime()
        : 0;

      if (!analytics[studentId]) {
        analytics[studentId] = {
          studentId,
          studentName,
          totalAttempts: 0,
          bestScore: score,
          latestScore: score,
          averageScoreTotal: 0,
          latestSubmittedAt: attempt.submittedAt || null,
          latestSubmittedTime: submittedTime,
        };
      }

      analytics[studentId].totalAttempts += 1;
      analytics[studentId].bestScore = Math.max(
        analytics[studentId].bestScore,
        score,
      );
      analytics[studentId].averageScoreTotal += score;

      if (submittedTime >= analytics[studentId].latestSubmittedTime) {
        analytics[studentId].latestSubmittedTime = submittedTime;
        analytics[studentId].latestSubmittedAt = attempt.submittedAt || null;
        analytics[studentId].latestScore = score;
      }

      return analytics;
    }, {}),
  )
    .map((student) => ({
      ...student,
      averageScore: (student.averageScoreTotal / student.totalAttempts).toFixed(
        1,
      ),
    }))
    .sort((first, second) => {
      if (second.bestScore !== first.bestScore) {
        return second.bestScore - first.bestScore;
      }

      if (second.totalAttempts !== first.totalAttempts) {
        return second.totalAttempts - first.totalAttempts;
      }

      return first.studentName.localeCompare(second.studentName);
    });

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
          <p className="stat-label">Students Reached</p>
          <p className="teacher-badge-value">{studentAnalytics.length}</p>
          <p className="section-subtitle">
            Based on grouped attempt history for the selected exam.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-box teacher-stat-box">
            <p className="stat-label">Total Attempts</p>
            <p className="stat-value">{totalAttempts}</p>
          </div>
          <div className="stat-box teacher-stat-box">
            <p className="stat-label">Highest Score</p>
            <p className="stat-value">{highestScore}</p>
          </div>
          <div className="stat-box teacher-stat-box">
            <p className="stat-label">Average Score</p>
            <p className="stat-value">{averageScore}</p>
          </div>
          <div className="stat-box teacher-stat-box">
            <p className="stat-label">Latest Submission</p>
            <p className="stat-value teacher-stat-value-compact">
              {latestSubmission
                ? new Date(latestSubmission).toLocaleString()
                : "No submissions yet"}
            </p>
          </div>
        </div>
      </section>

      <section className="teacher-page-section">
        <div className="panel p-6">
          <div>
            <h2 className="section-title">Student analytics</h2>
            <p className="section-subtitle">
              See how each student performed across all of their attempts for
              this exam.
            </p>
          </div>

          {studentAnalytics.length === 0 ? (
            <div className="panel teacher-empty-state mt-6 p-8 text-center">
              <h3 className="section-title">No student analytics yet</h3>
              <p className="section-subtitle">
                Analytics will appear here once students start submitting
                attempts.
              </p>
            </div>
          ) : (
            <div className="teacher-analytics-grid mt-6">
              {studentAnalytics.map((student) => (
                <article
                  key={student.studentId}
                  className="teacher-analytics-card"
                >
                  <div className="teacher-analytics-card-top">
                    <div>
                      <p className="teacher-analytics-name">
                        {student.studentName}
                      </p>
                      <p className="teacher-analytics-subtitle">
                        {student.totalAttempts}{" "}
                        {student.totalAttempts === 1 ? "attempt" : "attempts"}{" "}
                        recorded
                      </p>
                    </div>

                    <span className="teacher-analytics-pill">
                      Best {student.bestScore}
                    </span>
                  </div>

                  <div className="teacher-analytics-metrics">
                    <div className="teacher-analytics-metric">
                      <span className="stat-label">Latest Score</span>
                      <span className="teacher-analytics-metric-value">
                        {student.latestScore}
                      </span>
                    </div>
                    <div className="teacher-analytics-metric">
                      <span className="stat-label">Average Score</span>
                      <span className="teacher-analytics-metric-value">
                        {student.averageScore}
                      </span>
                    </div>
                    <div className="teacher-analytics-metric teacher-analytics-metric-wide">
                      <span className="stat-label">Latest Submission</span>
                      <span className="teacher-analytics-metric-value teacher-analytics-metric-date">
                        {student.latestSubmittedAt
                          ? new Date(student.latestSubmittedAt).toLocaleString()
                          : "Not submitted yet"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-6">
          <div>
            <h2 className="section-title">Attempt records</h2>
            <p className="section-subtitle">
              Review every attempt, including retakes, scores, and submission
              times.
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
                    <th>Attempt</th>
                    <th>Student Name</th>
                    <th>Score</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt._id}>
                      <td>Attempt #{attempt.attemptNumber || 1}</td>
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
