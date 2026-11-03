import { Fragment, useCallback, useEffect, useState } from "react";
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
  const [exportJobId, setExportJobId] = useState("");
  const [exportJobState, setExportJobState] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [exportFilePath, setExportFilePath] = useState("");
  const [isQueueingExport, setIsQueueingExport] = useState(false);
  const [refreshingResults, setRefreshingResults] = useState(false);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [attemptReviews, setAttemptReviews] = useState({});
  const [reviewLoadingAttemptId, setReviewLoadingAttemptId] = useState(null);
  const [reviewErrors, setReviewErrors] = useState({});

  const handlePrintResults = () => {
    window.print();
  };

  const handleQueueResultsExport = async () => {
    try {
      setIsQueueingExport(true);
      setExportMessage("");
      setExportFilePath("");
      const response = await API.post(`/exams/${examId}/attempts/export`);

      setExportJobId(String(response.data.jobId));
      setExportJobState(response.data.status || "queued");
      setExportMessage("Background export job queued. The worker will process it shortly.");
    } catch (error) {
      setExportMessage(
        error.response?.data?.message || "Unable to queue background export.",
      );
      setExportJobState("failed");
    } finally {
      setIsQueueingExport(false);
    }
  };

  const fetchResults = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshingResults(true);
        }
        setErrorMessage("");
        const response = await API.get(`/exams/${examId}/attempts`);
        setAttempts(response.data || []);
      } catch (error) {
        const message =
          error.response?.data?.message || "Unable to load results.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
        setRefreshingResults(false);
      }
    },
    [examId],
  );

  const handleReviewAttempt = async (attemptId) => {
    if (expandedAttemptId === attemptId) {
      setExpandedAttemptId(null);
      return;
    }

    setExpandedAttemptId(attemptId);
    if (attemptReviews[attemptId]) {
      return;
    }

    setReviewLoadingAttemptId(attemptId);
    setReviewErrors((currentErrors) => {
      const remainingErrors = { ...currentErrors };
      delete remainingErrors[attemptId];
      return remainingErrors;
    });

    try {
      const response = await API.get(
        `/exams/${examId}/attempts/${attemptId}/review`,
      );
      setAttemptReviews((currentReviews) => ({
        ...currentReviews,
        [attemptId]: response.data,
      }));
    } catch (error) {
      setReviewErrors((currentErrors) => ({
        ...currentErrors,
        [attemptId]:
          error.response?.data?.message || "Unable to load this attempt review.",
      }));
    } finally {
      setReviewLoadingAttemptId(null);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    if (!exportJobId) {
      return undefined;
    }

    let intervalId = null;

    const fetchExportStatus = async () => {
      try {
        const response = await API.get(`/exams/exports/jobs/${exportJobId}`);
        const nextState = response.data.state || "unknown";
        setExportJobState(nextState);

        if (response.data.result?.filePath) {
          setExportFilePath(response.data.result.filePath);
        }

        if (nextState === "completed") {
          setExportMessage("Background export finished successfully.");
          if (intervalId) {
            window.clearInterval(intervalId);
          }
        }

        if (nextState === "failed") {
          setExportMessage(
            response.data.failedReason || "Background export failed.",
          );
          if (intervalId) {
            window.clearInterval(intervalId);
          }
        }
      } catch (error) {
        setExportMessage(
          error.response?.data?.message || "Unable to refresh export status.",
        );
        if (intervalId) {
          window.clearInterval(intervalId);
        }
      }
    };

    fetchExportStatus();
    intervalId = window.setInterval(fetchExportStatus, 3000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [exportJobId]);

  const submittedAttempts = attempts.filter((attempt) => attempt.submittedAt);
  const totalAttempts = attempts.length;
  const highestScore =
    submittedAttempts.length > 0
      ? Math.max(...submittedAttempts.map((attempt) => Number(attempt.score) || 0))
      : 0;
  const averageScore =
    submittedAttempts.length > 0
      ? (
          submittedAttempts.reduce(
            (sum, attempt) => sum + (Number(attempt.score) || 0),
            0,
          ) / submittedAttempts.length
        ).toFixed(1)
      : "0.0";
  const latestSubmission = submittedAttempts.reduce(
    (latest, attempt) => {
      const submittedTime = new Date(attempt.submittedAt).getTime();
      return submittedTime > latest ? submittedTime : latest;
    },
    0,
  );
  const studentAnalytics = Object.values(
    attempts.reduce((analytics, attempt) => {
      const studentId = attempt.studentId?._id || `unknown-${attempt._id}`;
      const studentName = attempt.studentId?.name || "Unknown Student";

      if (!analytics[studentId]) {
        analytics[studentId] = {
          studentId,
          studentName,
          totalAttempts: 0,
          submittedAttempts: 0,
          bestScore: 0,
          latestScore: null,
          latestAttemptId: null,
          averageScoreTotal: 0,
          latestSubmittedAt: null,
          latestSubmittedTime: 0,
        };
      }

      analytics[studentId].totalAttempts += 1;
      if (!attempt.submittedAt) {
        return analytics;
      }

      const score = Number(attempt.score) || 0;
      const submittedTime = new Date(attempt.submittedAt).getTime();
      analytics[studentId].submittedAttempts += 1;
      analytics[studentId].bestScore = Math.max(
        analytics[studentId].bestScore,
        score,
      );
      analytics[studentId].averageScoreTotal += score;

      if (submittedTime >= analytics[studentId].latestSubmittedTime) {
        analytics[studentId].latestSubmittedTime = submittedTime;
        analytics[studentId].latestSubmittedAt = attempt.submittedAt;
        analytics[studentId].latestScore = score;
        analytics[studentId].latestAttemptId = attempt._id;
      }

      return analytics;
    }, {}),
  )
    .map((student) => ({
      ...student,
      averageScore: student.submittedAttempts
        ? (student.averageScoreTotal / student.submittedAttempts).toFixed(1)
        : "—",
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
          (Number(second.averageScore) || 0) -
          (Number(first.averageScore) || 0);
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
  const submittedFilteredAttempts = filteredAttempts.filter(
    (attempt) => attempt.submittedAt,
  );
  const scoreDistribution = [
    { label: "0 - 25", min: 0, max: 25, count: 0 },
    { label: "26 - 50", min: 26, max: 50, count: 0 },
    { label: "51 - 75", min: 51, max: 75, count: 0 },
    { label: "76 - 100", min: 76, max: 100, count: 0 },
    { label: "100+", min: 101, max: Number.POSITIVE_INFINITY, count: 0 },
  ].map((bucket) => ({
    ...bucket,
    count: submittedFilteredAttempts.filter((attempt) => {
      const score = Number(attempt.score) || 0;
      return score >= bucket.min && score <= bucket.max;
    }).length,
  }));
  const maxScoreDistributionCount =
    Math.max(...scoreDistribution.map((bucket) => bucket.count), 0) || 1;
  const attemptsPerStudentData = filteredStudentAnalytics
    .slice()
    .sort((first, second) => second.totalAttempts - first.totalAttempts)
    .slice(0, 6);
  const maxAttemptsPerStudent =
    Math.max(
      ...attemptsPerStudentData.map((student) => student.totalAttempts),
      0,
    ) || 1;

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
            onClick={() => fetchResults(true)}
            disabled={refreshingResults}
          >
            {refreshingResults ? "Refreshing..." : "Refresh Results"}
          </button>
          <button
            type="button"
            className="primary-button teacher-results-action-button"
            onClick={handleQueueResultsExport}
            disabled={isQueueingExport}
          >
            {isQueueingExport ? "Queueing Export..." : "Queue Background Export"}
          </button>
          <button
            type="button"
            className="secondary-button teacher-results-action-button"
            onClick={handlePrintResults}
          >
            Print / Export Results
          </button>
        </div>

        {exportMessage ? (
          <div className="teacher-badge-card no-print">
            <p className="stat-label">Background Export</p>
            <p className="teacher-badge-value">{exportJobState || "queued"}</p>
            <p className="section-subtitle">{exportMessage}</p>
            {exportJobId ? (
              <p className="section-subtitle">Job ID: {exportJobId}</p>
            ) : null}
            {exportFilePath ? (
              <p className="section-subtitle">Saved to: {exportFilePath}</p>
            ) : null}
          </div>
        ) : null}

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
            <p className="stat-value">
              {submittedAttempts.length ? highestScore : "—"}
            </p>
          </div>
          <div className="stat-box teacher-stat-box">
            <p className="stat-label">Average Score</p>
            <p className="stat-value">
              {submittedAttempts.length ? averageScore : "—"}
            </p>
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
            {filteredAttempts.length} attempts ({submittedFilteredAttempts.length}{" "}
            submitted) from {attempts.length} recorded attempts.
          </p>
        </div>

        <div className="panel p-6">
          <div>
            <h2 className="section-title">Analytics charts</h2>
            <p className="section-subtitle">
              Visual breakdown of score bands and highest attempt activity by
              student for the current filter.
            </p>
          </div>

          <div className="teacher-chart-grid mt-6">
            <article className="teacher-chart-card">
              <h3 className="section-title teacher-chart-title">
                Score distribution
              </h3>
              <p className="section-subtitle">
                Attempts grouped by score range.
              </p>

              <div className="teacher-chart-bars mt-5">
                {scoreDistribution.map((bucket) => {
                  const widthPercent =
                    (bucket.count / maxScoreDistributionCount) * 100;

                  return (
                    <div key={bucket.label} className="teacher-chart-row">
                      <span className="teacher-chart-label">{bucket.label}</span>
                      <div className="teacher-chart-bar-track">
                        <div
                          className="teacher-chart-bar-fill"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className="teacher-chart-value">{bucket.count}</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="teacher-chart-card">
              <h3 className="section-title teacher-chart-title">
                Attempts per student
              </h3>
              <p className="section-subtitle">
                Top students by number of attempts.
              </p>

              {attemptsPerStudentData.length === 0 ? (
                <div className="panel teacher-empty-state mt-5 p-5 text-center">
                  <p className="section-subtitle">
                    No student attempt data available for the current filter.
                  </p>
                </div>
              ) : (
                <div className="teacher-chart-bars mt-5">
                  {attemptsPerStudentData.map((student) => {
                    const widthPercent =
                      (student.totalAttempts / maxAttemptsPerStudent) * 100;

                    return (
                      <div
                        key={student.studentId}
                        className="teacher-chart-row"
                      >
                        <span className="teacher-chart-label teacher-chart-label-student">
                          {student.studentName}
                        </span>
                        <div className="teacher-chart-bar-track">
                          <div
                            className="teacher-chart-bar-fill teacher-chart-bar-fill-alt"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <span className="teacher-chart-value">
                          {student.totalAttempts}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          </div>
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
                      Best{" "}
                      {student.submittedAttempts ? student.bestScore : "—"}
                    </span>
                  </div>

                  <div className="teacher-analytics-metrics">
                    <div className="teacher-analytics-metric">
                      <span className="stat-label">Latest Score</span>
                      <span className="teacher-analytics-metric-value">
                        {student.latestScore ?? "—"}
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
                {attempts.length === 0
                  ? "Student attempts will appear here when they start this exam."
                  : "Adjust the filter or search to see more attempt records."}
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="teacher-results-table">
                <thead>
                  <tr>
                    <th>Attempt</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Submitted At</th>
                    <th>Answer Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((attempt) => (
                    <Fragment key={attempt._id}>
                      <tr>
                        <td>Attempt #{attempt.attemptNumber || 1}</td>
                        <td>
                          <div>{attempt.studentId?.name || "Unknown Student"}</div>
                          {attempt.studentId?.email ? (
                            <small>{attempt.studentId.email}</small>
                          ) : null}
                        </td>
                        <td>{attempt.submittedAt ? "Submitted" : "In progress"}</td>
                        <td>{attempt.submittedAt ? attempt.score ?? 0 : "—"}</td>
                        <td>
                          {attempt.submittedAt
                            ? new Date(attempt.submittedAt).toLocaleString()
                            : "Not submitted yet"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleReviewAttempt(attempt._id)}
                            disabled={!attempt.submittedAt}
                          >
                            {expandedAttemptId === attempt._id
                              ? "Hide review"
                              : attempt.submittedAt
                                ? "Review answers"
                                : "Available after submission"}
                          </button>
                        </td>
                      </tr>
                      {expandedAttemptId === attempt._id ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="panel p-5">
                              <h3 className="section-title">
                                Answer review:{" "}
                                {attempt.studentId?.name || "Unknown Student"}
                              </h3>
                              {reviewLoadingAttemptId === attempt._id ? (
                                <p className="section-subtitle mt-3">
                                  Loading submitted answers...
                                </p>
                              ) : null}
                              {reviewErrors[attempt._id] ? (
                                <p className="student-exam-note student-exam-note-blocked mt-3">
                                  {reviewErrors[attempt._id]}
                                </p>
                              ) : null}
                              {attemptReviews[attempt._id] ? (
                                <>
                                  <p className="section-subtitle mt-2">
                                    Attempt #{attemptReviews[attempt._id].attemptNumber}{" "}
                                    · Score {attemptReviews[attempt._id].score} /{" "}
                                    {attemptReviews[attempt._id].totalMarks} ·
                                    Submitted{" "}
                                    {attemptReviews[attempt._id].submittedAt
                                      ? new Date(
                                          attemptReviews[attempt._id].submittedAt,
                                        ).toLocaleString()
                                      : "Not submitted"}
                                  </p>
                                  {attemptReviews[attempt._id].reviewQuestions
                                    .length === 0 ? (
                                    <p className="section-subtitle mt-4">
                                      No questions are available for this exam.
                                    </p>
                                  ) : (
                                    <div className="result-review-list mt-5">
                                      {attemptReviews[
                                        attempt._id
                                      ].reviewQuestions.map((question) => {
                                        const selectedLabel =
                                          question.selectedOption !== null
                                            ? `Option ${question.selectedOption + 1}`
                                            : "Not answered";
                                        const correctLabel = `Option ${
                                          question.correctAnswer + 1
                                        }`;

                                        return (
                                          <article
                                            key={question.questionId}
                                            className={`result-review-card ${
                                              question.selectedOption === null
                                                ? "result-review-card-unanswered"
                                                : question.isCorrect
                                                  ? "result-review-card-correct"
                                                  : "result-review-card-incorrect"
                                            }`}
                                          >
                                            <div className="result-review-header">
                                              <div>
                                                <p className="question-number">
                                                  Question {question.questionNumber}
                                                </p>
                                                <h4 className="section-title mt-2">
                                                  {question.questionText}
                                                </h4>
                                              </div>
                                              <span
                                                className={`result-status-pill ${
                                                  question.selectedOption === null
                                                    ? "result-status-pill-unanswered"
                                                    : question.isCorrect
                                                      ? "result-status-pill-correct"
                                                      : "result-status-pill-incorrect"
                                                }`}
                                              >
                                                {question.selectedOption === null
                                                  ? "Not answered"
                                                  : question.isCorrect
                                                    ? "Correct"
                                                    : "Incorrect"}
                                              </span>
                                            </div>
                                            <div className="result-options-list">
                                              {question.options.map(
                                                (option, index) => {
                                                  const isSelected =
                                                    question.selectedOption ===
                                                    index;
                                                  const isCorrect =
                                                    question.correctAnswer ===
                                                    index;

                                                  return (
                                                    <div
                                                      key={`${question.questionId}-${index}`}
                                                      className={`result-option-card ${
                                                        isCorrect
                                                          ? "result-option-card-correct"
                                                          : isSelected
                                                            ? "result-option-card-selected"
                                                            : ""
                                                      }`}
                                                    >
                                                      <span className="option-badge">
                                                        {String.fromCharCode(
                                                          65 + index,
                                                        )}
                                                      </span>
                                                      <div className="result-option-copy">
                                                        <p>{option}</p>
                                                        <div className="result-option-tags">
                                                          {isSelected ? (
                                                            <span className="result-option-tag result-option-tag-selected">
                                                              Student answer
                                                            </span>
                                                          ) : null}
                                                          {isCorrect ? (
                                                            <span className="result-option-tag result-option-tag-correct">
                                                              Correct answer
                                                            </span>
                                                          ) : null}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                },
                                              )}
                                            </div>
                                            <div className="result-answer-summary">
                                              <div className="stat-box teacher-stat-box">
                                                <p className="stat-label">
                                                  Student Answer
                                                </p>
                                                <p className="result-answer-value">
                                                  {selectedLabel}
                                                </p>
                                              </div>
                                              <div className="stat-box teacher-stat-box">
                                                <p className="stat-label">
                                                  Correct Answer
                                                </p>
                                                <p className="result-answer-value">
                                                  {correctLabel}
                                                </p>
                                              </div>
                                              <div className="stat-box teacher-stat-box">
                                                <p className="stat-label">
                                                  Marks Earned
                                                </p>
                                                <p className="result-answer-value">
                                                  {question.earnedMarks} /{" "}
                                                  {question.marks}
                                                </p>
                                              </div>
                                            </div>
                                          </article>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
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
