import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentAttempts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => Number(attempt.score) || 0))
      : 0;
  const averageScore =
    attempts.length > 0
      ? (
          attempts.reduce(
            (total, attempt) => total + (Number(attempt.score) || 0),
            0,
          ) / attempts.length
        ).toFixed(1)
      : "0.0";
  const latestAttemptDate =
    attempts.length > 0
      ? attempts.reduce((latest, attempt) => {
          if (!attempt.submittedAt) {
            return latest;
          }

          const submittedAt = new Date(attempt.submittedAt);
          return !latest || submittedAt > latest ? submittedAt : latest;
        }, null)
      : null;
  const filteredAttempts = attempts.filter((attempt) => {
    const searchValue = searchQuery.trim().toLowerCase();
    const title = attempt.examId?.title?.toLowerCase() || "";
    const examCode = attempt.examId?.examCode?.toLowerCase() || "";

    if (
      searchValue &&
      !title.includes(searchValue) &&
      !examCode.includes(searchValue)
    ) {
      return false;
    }

    if (filterBy === "completed") {
      return Boolean(attempt.submittedAt);
    }

    if (filterBy === "pending") {
      return !attempt.submittedAt;
    }

    return true;
  });
  const visibleAttempts = [...filteredAttempts].sort((first, second) => {
    if (sortBy === "highest") {
      return (Number(second.score) || 0) - (Number(first.score) || 0);
    }

    if (sortBy === "lowest") {
      return (Number(first.score) || 0) - (Number(second.score) || 0);
    }

    const firstDate = first.submittedAt
      ? new Date(first.submittedAt).getTime()
      : 0;
    const secondDate = second.submittedAt
      ? new Date(second.submittedAt).getTime()
      : 0;

    return secondDate - firstDate;
  });

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
            <p className="stat-value">{bestScore}</p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Average Score</p>
            <p className="stat-value">{averageScore}</p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Latest Attempt</p>
            <p className="stat-value">
              {latestAttemptDate
                ? latestAttemptDate.toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </section>

      <section className="student-page-section">
        <div className="panel student-attempt-toolbar">
          <div>
            <h2 className="section-title">History Controls</h2>
            <p className="section-subtitle">
              Showing {visibleAttempts.length} of {attempts.length} attempts.
            </p>
          </div>

          <div className="student-attempt-controls">
            <label className="student-filter-group student-search-group">
              <span className="student-filter-label">Search</span>
              <input
                type="text"
                className="form-input student-filter-input"
                placeholder="Search by exam title or code"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="student-filter-group">
              <span className="student-filter-label">Sort By</span>
              <select
                className="form-input student-filter-input"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="highest">Highest Score</option>
                <option value="lowest">Lowest Score</option>
              </select>
            </label>

            <div className="student-filter-group">
              <span className="student-filter-label">Filter</span>
              <div className="student-filter-chips">
                <button
                  type="button"
                  className={`student-filter-chip ${
                    filterBy === "all" ? "student-filter-chip-active" : ""
                  }`}
                  onClick={() => setFilterBy("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`student-filter-chip ${
                    filterBy === "completed"
                      ? "student-filter-chip-active"
                      : ""
                  }`}
                  onClick={() => setFilterBy("completed")}
                >
                  Completed
                </button>
                <button
                  type="button"
                  className={`student-filter-chip ${
                    filterBy === "pending"
                      ? "student-filter-chip-active"
                      : ""
                  }`}
                  onClick={() => setFilterBy("pending")}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>
        </div>

        {visibleAttempts.length === 0 ? (
          <div className="panel p-8 text-center">
            <h2 className="section-title">No attempts match this view</h2>
            <p className="section-subtitle">
              Try a different search, filter, or sort option to see more
              results.
            </p>
          </div>
        ) : (
        <div className="exam-grid">
          {visibleAttempts.map((attempt) => (
            <article
              key={attempt._id}
              className="exam-card student-exam-card student-attempt-card"
            >
              <div className="student-attempt-header">
                <div>
                  <h2 className="section-title">
                    {attempt.examId?.title || "Unknown Exam"}
                  </h2>
                  <p className="section-subtitle">
                    Review your performance for this completed exam attempt.
                  </p>
                </div>
                <span className="student-attempt-score-pill">
                  Score: {attempt.score ?? 0}
                </span>
              </div>

              <div className="exam-card-meta mt-5">
                <div className="meta-row">
                  <span>Attempt</span>
                  <strong>Attempt #{attempt.attemptNumber || 1}</strong>
                </div>
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
                  <span>Submitted At</span>
                  <strong>
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleString()
                      : "Not submitted yet"}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                className="primary-button mt-6 w-full"
                onClick={() => {
                  if (!attempt.examId?._id) {
                    return;
                  }

                  navigate(`/result/${attempt._id}`);
                }}
                disabled={!attempt._id}
              >
                View Result
              </button>
            </article>
          ))}
        </div>
        )}
      </section>
    </div>
  );
};

export default StudentAttempts;
