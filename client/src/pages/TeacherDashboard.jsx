import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingRetakeExamId, setEditingRetakeExamId] = useState(null);
  const [retakeForm, setRetakeForm] = useState({
    allowRetakes: false,
    maxAttempts: "1",
  });
  const [savingRetakeId, setSavingRetakeId] = useState(null);
  const [processingExamActionId, setProcessingExamActionId] = useState(null);
  const [workspaceCode, setWorkspaceCode] = useState(user?.workspaceCode || "");
  const [openActionsExamId, setOpenActionsExamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [publishFilter, setPublishFilter] = useState("all");
  const [retakeFilter, setRetakeFilter] = useState("all");
  const [attemptFilter, setAttemptFilter] = useState("all");

  const fetchTeacherExams = async () => {
    if (!user?.id) {
      setLoading(false);
      setErrorMessage("Please log in again to access your exams.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const workspaceResponse = await API.get("/exams/workspace/code");
      setWorkspaceCode(workspaceResponse.data.workspaceCode || "");

      const examsResponse = await API.get(`/exams/teacher/${user.id}`);
      setExams(examsResponse.data);
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

  useEffect(() => {
    fetchTeacherExams();
  }, [user?.id]);

  const handleCreateExam = () => {
    navigate("/exams");
  };

  const handleViewExam = (examId) => {
    navigate("/add-questions", { state: { examId } });
  };

  const handleViewResults = (examId) => {
    navigate(`/teacher-results/${examId}`);
  };

  const handleEditExam = (examId) => {
    navigate(`/teacher/exams/${examId}/edit`);
  };

  const handleOpenRetakeSettings = (exam) => {
    setEditingRetakeExamId(exam._id);
    setOpenActionsExamId(null);
    setRetakeForm({
      allowRetakes: Boolean(exam.allowRetakes),
      maxAttempts: String(exam.maxAttempts || 1),
    });
  };

  const handleCancelRetakeSettings = () => {
    setEditingRetakeExamId(null);
    setRetakeForm({
      allowRetakes: false,
      maxAttempts: "1",
    });
  };

  const handleSaveRetakeSettings = async (examId) => {
    const nextMaxAttempts = retakeForm.allowRetakes
      ? Number(retakeForm.maxAttempts)
      : 1;

    if (
      Number.isNaN(nextMaxAttempts) ||
      !Number.isInteger(nextMaxAttempts) ||
      nextMaxAttempts <= 0
    ) {
      alert("Maximum attempts must be a positive whole number.");
      return;
    }

    try {
      setSavingRetakeId(examId);
      const response = await API.patch(`/exams/${examId}/retake-settings`, {
        allowRetakes: retakeForm.allowRetakes,
        maxAttempts: nextMaxAttempts,
      });

      setExams((currentExams) =>
        currentExams.map((exam) =>
          exam._id === examId ? response.data.exam : exam,
        ),
      );
      handleCancelRetakeSettings();
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to update retake settings.",
      );
    } finally {
      setSavingRetakeId(null);
    }
  };

  const handleArchiveExam = async (exam) => {
    setOpenActionsExamId(null);
    const confirmed = window.confirm(
      `Archive "${exam.title}"? This will remove it from active teacher and student views.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingExamActionId(exam._id);
      await API.patch(`/exams/${exam._id}/archive`);
      setExams((currentExams) =>
        currentExams.filter((currentExam) => currentExam._id !== exam._id),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Unable to archive this exam.");
    } finally {
      setProcessingExamActionId(null);
    }
  };

  const handleDeleteExam = async (exam) => {
    setOpenActionsExamId(null);
    const confirmed = window.confirm(
      `Delete "${exam.title}" permanently? This can only be done when there are no recorded attempts.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingExamActionId(exam._id);
      await API.delete(`/exams/${exam._id}`);
      setExams((currentExams) =>
        currentExams.filter((currentExam) => currentExam._id !== exam._id),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Unable to delete this exam.");
    } finally {
      setProcessingExamActionId(null);
    }
  };

  const recentExamCode =
    exams.find((exam) => exam.examCode)?.examCode || "Not assigned";
  const filteredExams = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    return exams.filter((exam) => {
      const title = exam.title?.toLowerCase() || "";
      const code = exam.examCode?.toLowerCase() || "";
      const matchesSearch = normalizedSearchQuery
        ? title.includes(normalizedSearchQuery) ||
          code.includes(normalizedSearchQuery)
        : true;

      if (!matchesSearch) {
        return false;
      }

      if (publishFilter === "published" && !exam.isPublished) {
        return false;
      }

      if (publishFilter === "draft" && exam.isPublished) {
        return false;
      }

      if (retakeFilter === "retakes" && !exam.allowRetakes) {
        return false;
      }

      if (retakeFilter === "single" && exam.allowRetakes) {
        return false;
      }

      const attemptsCount = Number(exam.attemptsCount) || 0;
      if (attemptFilter === "withAttempts" && attemptsCount === 0) {
        return false;
      }

      if (attemptFilter === "noAttempts" && attemptsCount > 0) {
        return false;
      }

      return true;
    });
  }, [attemptFilter, exams, publishFilter, retakeFilter, searchQuery]);

  const handleCopyWorkspaceCode = async () => {
    if (!workspaceCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(workspaceCode);
      alert("Workspace code copied.");
    } catch {
      alert(`Your workspace code is ${workspaceCode}`);
    }
  };

  return (
    <div className="teacher-page-shell">
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
          <div className="teacher-badge-card border-l-4 border-blue-600 bg-white shadow-sm transition-all hover:shadow-md">
            <p className="stat-label">Workspace Code</p>
            <p className="teacher-badge-value font-mono tracking-tighter text-blue-700">
              {workspaceCode || "Generating..."}
            </p>
            <p className="section-subtitle">
              Share this code with students so they can join your exam space.
            </p>
            <button
              type="button"
              className="secondary-button mt-4 w-full"
              onClick={handleCopyWorkspaceCode}
              disabled={!workspaceCode}
            >
              Copy Code
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-box teacher-stat-box group border border-transparent transition-all hover:border-blue-100 hover:shadow-sm">
            <p className="stat-label">Created Exams</p>
            <p className="stat-value transition-colors group-hover:text-blue-600">{exams.length}</p>
          </div>
          <div className="stat-box teacher-stat-box group border border-transparent transition-all hover:border-blue-100 hover:shadow-sm">
            <p className="stat-label">Role</p>
            <p className="stat-value">{user?.role || "Teacher"}</p>
          </div>
          <div className="stat-box teacher-stat-box group border border-transparent transition-all hover:border-blue-100 hover:shadow-sm">
            <p className="stat-label">Latest Exam Code</p>
            <p className="stat-value font-mono text-slate-500">{recentExamCode}</p>
          </div>
        </div>
      </section>

      <section className="teacher-page-section">
        {!loading && exams.length > 0 ? (
          <div className="panel p-6">
            <div className="teacher-dashboard-toolbar">
              <div className="teacher-dashboard-toolbar-group teacher-dashboard-toolbar-search">
                <label className="field-label" htmlFor="teacher-exam-search">
                  Search Exams
                </label>
                <input
                  id="teacher-exam-search"
                  type="text"
                  className="form-input"
                  placeholder="Search by exam title or code"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="teacher-dashboard-toolbar-group">
                <label className="field-label" htmlFor="teacher-publish-filter">
                  Publish Status
                </label>
                <select
                  id="teacher-publish-filter"
                  className="form-input"
                  value={publishFilter}
                  onChange={(event) => setPublishFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="teacher-dashboard-toolbar-group">
                <label className="field-label" htmlFor="teacher-retake-filter">
                  Retake Mode
                </label>
                <select
                  id="teacher-retake-filter"
                  className="form-input"
                  value={retakeFilter}
                  onChange={(event) => setRetakeFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  <option value="retakes">Retakes Enabled</option>
                  <option value="single">Single Attempt</option>
                </select>
              </div>

              <div className="teacher-dashboard-toolbar-group">
                <label className="field-label" htmlFor="teacher-attempt-filter">
                  Attempt Activity
                </label>
                <select
                  id="teacher-attempt-filter"
                  className="form-input"
                  value={attemptFilter}
                  onChange={(event) => setAttemptFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  <option value="withAttempts">With Attempts</option>
                  <option value="noAttempts">No Attempts</option>
                </select>
              </div>
            </div>

            <p className="teacher-dashboard-toolbar-summary">
              Showing {filteredExams.length} exams out of {exams.length} total
              exams.
            </p>
          </div>
        ) : null}

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
        ) : filteredExams.length === 0 ? (
          <div className="panel teacher-empty-state p-8 text-center">
            <h2 className="section-title">No matching exams</h2>
            <p className="section-subtitle">
              Try changing search or filters to view more exams.
            </p>
          </div>
        ) : (
          <div className="exam-grid">
            {filteredExams.map((exam) => (
              <article key={exam._id} className="exam-card teacher-exam-card transition-all hover:border-blue-200 hover:shadow-lg">
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

                <div className="exam-card-meta mt-5 space-y-1 border-t border-[var(--border)] pt-4">
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
                    <strong className={exam.isPublished ? "text-emerald-600" : "text-amber-600"}>
                      {exam.isPublished ? "Published" : "Draft"}
                    </strong>
                  </div>
                  <div className="meta-row">
                    <span>Retake Policy</span>
                    <strong>
                      {exam.allowRetakes
                        ? `${exam.maxAttempts || 1} attempts allowed`
                        : "Single attempt only"}
                    </strong>
                  </div>
                  <div className="meta-row">
                    <span>Recorded Attempts</span>
                    <strong>{exam.attemptsCount || 0}</strong>
                  </div>
                </div>

                {editingRetakeExamId === exam._id ? (
                  <div className="teacher-retake-editor">
                    <div className="teacher-retake-editor-header">
                      <div>
                        <h3 className="section-title">Retake settings</h3>
                        <p className="section-subtitle">
                          Update whether students can retry this exam later.
                        </p>
                      </div>
                    </div>

                    <label className="teacher-retake-toggle">
                      <input
                        type="checkbox"
                        checked={retakeForm.allowRetakes}
                        onChange={(event) =>
                          setRetakeForm((current) => ({
                            ...current,
                            allowRetakes: event.target.checked,
                            maxAttempts: event.target.checked
                              ? current.maxAttempts || "2"
                              : "1",
                          }))
                        }
                        disabled={savingRetakeId === exam._id}
                      />
                      <span>Allow retakes for this exam</span>
                    </label>

                    <div className="teacher-retake-field">
                      <label className="field-label" htmlFor={`max-${exam._id}`}>
                        Maximum Attempts
                      </label>
                      <input
                        id={`max-${exam._id}`}
                        type="number"
                        min="1"
                        className="form-input"
                        value={retakeForm.maxAttempts}
                        onChange={(event) =>
                          setRetakeForm((current) => ({
                            ...current,
                            maxAttempts: event.target.value,
                          }))
                        }
                        disabled={
                          savingRetakeId === exam._id || !retakeForm.allowRetakes
                        }
                      />
                    </div>

                    <div className="teacher-retake-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleSaveRetakeSettings(exam._id)}
                        disabled={savingRetakeId === exam._id}
                      >
                        {savingRetakeId === exam._id
                          ? "Saving..."
                          : "Save Retake Settings"}
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handleCancelRetakeSettings}
                        disabled={savingRetakeId === exam._id}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="teacher-card-actions">
                  <button
                    onClick={() => handleViewExam(exam._id)}
                    className="primary-button"
                    disabled={processingExamActionId === exam._id}
                  >
                    Manage Questions
                  </button>

                  <button
                    onClick={() => handleViewResults(exam._id)}
                    className="secondary-button"
                    disabled={processingExamActionId === exam._id}
                  >
                    View Results
                  </button>
                </div>

                <div className="teacher-card-menu-wrap">
                  <button
                    type="button"
                    className="teacher-card-menu-trigger"
                    onClick={() =>
                      setOpenActionsExamId((current) =>
                        current === exam._id ? null : exam._id,
                      )
                    }
                    disabled={processingExamActionId === exam._id}
                  >
                    More actions
                  </button>

                  {openActionsExamId === exam._id ? (
                    <div className="teacher-card-menu absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[var(--border)] bg-white p-2 shadow-2xl animate-in fade-in zoom-in duration-150">
                      <button
                        type="button"
                        onClick={() => handleEditExam(exam._id)}
                        className="teacher-card-menu-item"
                        disabled={processingExamActionId === exam._id}
                      >
                        Edit exam
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenRetakeSettings(exam)}
                        className="teacher-card-menu-item"
                        disabled={processingExamActionId === exam._id}
                      >
                        Retake settings
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchiveExam(exam)}
                        className="teacher-card-menu-item teacher-card-menu-item-warning"
                        disabled={processingExamActionId === exam._id}
                      >
                        {processingExamActionId === exam._id
                          ? "Processing..."
                          : "Archive exam"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExam(exam)}
                        className="teacher-card-menu-item teacher-card-menu-item-danger"
                        disabled={
                          processingExamActionId === exam._id ||
                          Number(exam.attemptsCount) > 0
                        }
                        title={
                          Number(exam.attemptsCount) > 0
                            ? "Exams with recorded attempts must be archived instead of deleted."
                            : "Delete this exam permanently"
                        }
                      >
                        Delete exam
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TeacherDashboard;
