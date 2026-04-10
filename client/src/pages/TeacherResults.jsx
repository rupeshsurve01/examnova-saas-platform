import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const TeacherResults = () => {
  const { examId } = useParams();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSortBy, setStudentSortBy] = useState("bestScore");
  const [attemptFilter, setAttemptFilter] = useState("all");

  const handlePrintResults = () => {
    window.print();
  };

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
          latestAttemptId: attempt._id,
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
        analytics[studentId].latestAttemptId = attempt._id;
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
    .sort((first, second) => first.studentName.localeCompare(second.studentName));
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredStudentAnalytics = studentAnalytics
    .filter((student) =>
      normalizedSearchQuery
        ? student.studentName.toLowerCase().includes(normalizedSearchQuery)
        : true,
    )
    .sort((first, second) => {
      if (studentSortBy === "averageScore") {
        const averageDelta =
          Number(second.averageScore) - Number(first.averageScore);
        if (averageDelta !== 0) {
          return averageDelta;
        }
      }

      if (studentSortBy === "totalAttempts") {
        if (second.totalAttempts !== first.totalAttempts) {
          return second.totalAttempts - first.totalAttempts;
        }
      }

      if (studentSortBy === "latestSubmission") {
        if (second.latestSubmittedTime !== first.latestSubmittedTime) {
          return second.latestSubmittedTime - first.latestSubmittedTime;
        }
      }

      if (studentSortBy === "bestScore") {
        if (second.bestScore !== first.bestScore) {
          return second.bestScore - first.bestScore;
        }
      }

      return first.studentName.localeCompare(second.studentName);
    });
  const filteredAttempts = attempts.filter((attempt) => {
    const studentName = attempt.studentId?.name?.toLowerCase() || "";
    const matchesSearch = normalizedSearchQuery
      ? studentName.includes(normalizedSearchQuery)
      : true;

    if (!matchesSearch) {
      return false;
    }

    if (attemptFilter === "submitted") {
      return Boolean(attempt.submittedAt);
    }

    if (attemptFilter === "latestOnly") {
      const matchingStudent = filteredStudentAnalytics.find(
        (student) => student.studentId === (attempt.studentId?._id || `unknown-${attempt._id}`),
      );

      return matchingStudent ? matchingStudent.latestAttemptId === attempt._id : false;
    }

    return true;
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

        <div className="teacher-results-actions no-print">
          <button
            type="button"
            className="secondary-button teacher-results-action-button"
            onClick={handlePrintResults}
          >
            Print / Export Results
          </button>
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
          <div className="teacher-results-toolbar">
            <div className="teacher-results-toolbar-group teacher-results-toolbar-search">
              <label className="field-label" htmlFor="teacher-results-search">
                Search Student
              </label>
              <input
                id="teacher-results-search"
                type="text"
                className="form-input"
                placeholder="Search by student name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="teacher-results-toolbar-group">
              <label className="field-label" htmlFor="teacher-results-sort">
                Sort Analytics
              </label>
              <select
                id="teacher-results-sort"
                className="form-input"
                value={studentSortBy}
                onChange={(event) => setStudentSortBy(event.target.value)}
              >
                <option value="bestScore">Best Score</option>
                <option value="averageScore">Average Score</option>
                <option value="totalAttempts">Most Attempts</option>
                <option value="latestSubmission">Latest Submission</option>
              </select>
            </div>

            <div className="teacher-results-toolbar-group">
              <label className="field-label" htmlFor="teacher-results-filter">
                Filter Attempts
              </label>
              <select
                id="teacher-results-filter"
                className="form-input"
                value={attemptFilter}
                onChange={(event) => setAttemptFilter(event.target.value)}
              >
                <option value="all">All Attempts</option>
                <option value="submitted">Submitted Only</option>
                <option value="latestOnly">Latest Attempt Only</option>
              </select>
            </div>
          </div>

          <p className="teacher-results-toolbar-summary">
            Showing {filteredStudentAnalytics.length} students and{" "}
            {filteredAttempts.length} attempts from {attempts.length} recorded
            attempts.
          </p>
        </div>

        <div className="panel p-6">
          <div>
            <h2 className="section-title">Student analytics</h2>
            <p className="section-subtitle">
              See how each student performed across all of their attempts for
              this exam.
            </p>
          </div>

          {filteredStudentAnalytics.length === 0 ? (
            <div className="panel teacher-empty-state mt-6 p-8 text-center">
              <h3 className="section-title">No matching students</h3>
              <p className="section-subtitle">
                Try a different search term or sorting combination.
              </p>
            </div>
          ) : (
            <div className="teacher-analytics-grid mt-6">
              {filteredStudentAnalytics.map((student) => (
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

          {filteredAttempts.length === 0 ? (
            <div className="panel teacher-empty-state mt-6 p-8 text-center">
              <h3 className="section-title">No matching attempts</h3>
              <p className="section-subtitle">
                Adjust the filter or search to see more attempt records.
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
                  {filteredAttempts.map((attempt) => (
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
