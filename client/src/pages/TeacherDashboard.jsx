import { useEffect, useState } from "react";
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
          <div className="teacher-badge-card">
            <p className="stat-label">Workspace Code</p>
            <p className="teacher-badge-value">
              {workspaceCode || "Generating..."}
            </p>
            <p className="section-subtitle">
              Share this code with students so they can join your exam space.
            </p>
            <button
              type="button"
              className="secondary-button mt-4"
              onClick={handleCopyWorkspaceCode}
              disabled={!workspaceCode}
            >
              Copy Code
            </button>
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
            <p className="stat-label">Latest Exam Code</p>
            <p className="stat-value">{recentExamCode}</p>
          </div>
        </div>
      </section>

      <section className="teacher-page-section">
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
                    onClick={() => handleEditExam(exam._id)}
                    className="secondary-button"
                    disabled={processingExamActionId === exam._id}
                  >
                    Edit Exam
                  </button>

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

                  <button
                    onClick={() => handleOpenRetakeSettings(exam)}
                    className="secondary-button"
                    disabled={processingExamActionId === exam._id}
                  >
                    Retake Settings
                  </button>

                  <button
                    onClick={() => handleArchiveExam(exam)}
                    className="secondary-button"
                    disabled={processingExamActionId === exam._id}
                  >
                    {processingExamActionId === exam._id
                      ? "Processing..."
                      : "Archive Exam"}
                  </button>

                  <button
                    onClick={() => handleDeleteExam(exam)}
                    className="secondary-button"
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
                    Delete Exam
                  </button>

                  <button onClick={handleCreateExam} className="secondary-button">
                    Create Another
                  </button>
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
