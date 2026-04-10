import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const createInitialForm = () => ({
  title: "",
  description: "",
  duration: "60",
  totalMarks: "100",
  examCode: "",
  allowRetakes: false,
  maxAttempts: "1",
  isPublished: false,
});

function EditExam() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState(createInitialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const examSummary = useMemo(
    () => [
      {
        label: "Duration",
        value: `${formData.duration || "0"} min`,
      },
      {
        label: "Total Marks",
        value: formData.totalMarks || "0",
      },
      {
        label: "Status",
        value: formData.isPublished ? "Published" : "Draft",
      },
      {
        label: "Attempts",
        value: formData.allowRetakes
          ? `${formData.maxAttempts || "1"} allowed`
          : "Single attempt",
      },
    ],
    [
      formData.allowRetakes,
      formData.duration,
      formData.isPublished,
      formData.maxAttempts,
      formData.totalMarks,
    ],
  );

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await API.get(`/exams/${examId}`);
        const exam = response.data;

        setFormData({
          title: exam.title || "",
          description: exam.description || "",
          duration: String(exam.duration || "60"),
          totalMarks: String(exam.totalMarks || "100"),
          examCode: exam.examCode || "",
          allowRetakes: Boolean(exam.allowRetakes),
          maxAttempts: String(exam.maxAttempts || 1),
          isPublished: Boolean(exam.isPublished),
        });
      } catch (error) {
        const message = error.response?.data?.message;

        if (message === "Unauthorized") {
          logout();
          navigate("/");
          return;
        }

        setErrorMessage(message || "Unable to load this exam.");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, logout, navigate]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "allowRetakes" && !checked ? { maxAttempts: "1" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      duration: Number(formData.duration),
      totalMarks: Number(formData.totalMarks),
      examCode: formData.examCode.trim().toUpperCase(),
      allowRetakes: formData.allowRetakes,
      maxAttempts: formData.allowRetakes ? Number(formData.maxAttempts) : 1,
      isPublished: formData.isPublished,
    };

    if (
      !payload.title ||
      !payload.description ||
      !payload.examCode ||
      Number.isNaN(payload.duration) ||
      payload.duration <= 0 ||
      Number.isNaN(payload.totalMarks) ||
      payload.totalMarks <= 0 ||
      Number.isNaN(payload.maxAttempts) ||
      payload.maxAttempts <= 0
    ) {
      setErrorMessage(
        "Enter a title, description, exam code, and valid positive numbers for duration, total marks, and allowed attempts.",
      );
      setSuccessMessage("");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await API.patch(`/exams/${examId}`, payload);
      setSuccessMessage("Exam updated successfully.");
    } catch (error) {
      const message = error.response?.data?.message;
      setErrorMessage(message || "Unable to update this exam.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-page-shell">
        <section className="page-header teacher-hero">
          <div>
            <span className="teacher-kicker">Exam Editor</span>
            <h1 className="page-title">Edit exam details</h1>
            <p className="page-subtitle">
              Loading the saved exam configuration so you can make updates.
            </p>
          </div>
        </section>

        <section className="teacher-page-section">
          <div className="panel teacher-empty-state p-8 text-center">
            <h2 className="section-title">Loading exam</h2>
            <p className="section-subtitle">
              Pulling the current exam details into the editor.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="teacher-page-shell">
      <section className="page-header teacher-hero">
        <div>
          <span className="teacher-kicker">Exam Editor</span>
          <h1 className="page-title">Update exam details</h1>
          <p className="page-subtitle">
            Adjust the exam configuration, publication status, and retake
            policy from one place without recreating the paper.
          </p>
        </div>

        <div className="teacher-badge-card">
          <p className="stat-label">Exam Code</p>
          <p className="teacher-badge-value">{formData.examCode || "Pending"}</p>
          <p className="section-subtitle">
            Keep this code stable if students already rely on it.
          </p>
        </div>

        <div className="stats-grid">
          {examSummary.map((item) => (
            <div key={item.label} className="stat-box teacher-stat-box">
              <p className="stat-label">{item.label}</p>
              <p className="stat-value">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="teacher-page-section grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-[var(--muted)]">
              {user?.name ? `Logged in as ${user.name}` : "Teacher workspace"}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/teacher")}
                className="secondary-button"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate("/add-questions", { state: { examId } })}
                className="secondary-button"
              >
                Manage Questions
              </button>
            </div>
          </div>

          <div>
            <h2 className="section-title">Exam details</h2>
            <p className="section-subtitle">
              Update the same core settings you used when creating the exam,
              including publication and retake options.
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="form-grid mt-6">
            <div>
              <label htmlFor="title" className="field-label">
                Exam Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="5"
                className="form-input resize-y"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="duration" className="field-label">
                  Duration (minutes)
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.duration}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="totalMarks" className="field-label">
                  Total Marks
                </label>
                <input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="examCode" className="field-label">
                Exam Code
              </label>
              <input
                id="examCode"
                name="examCode"
                type="text"
                className="form-input"
                value={formData.examCode}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="rounded-2xl border border-[#d7e4fb] bg-[#f8fbff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <label htmlFor="isPublished" className="field-label mb-0">
                    Publish Status
                  </label>
                  <p className="section-subtitle mt-1">
                    Control whether students can see and start this exam.
                  </p>
                </div>
                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
                  <input
                    id="isPublished"
                    name="isPublished"
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e4fb] bg-[#f8fbff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <label htmlFor="allowRetakes" className="field-label mb-0">
                    Allow Retakes
                  </label>
                  <p className="section-subtitle mt-1">
                    Update whether students can attempt the same exam more than
                    once.
                  </p>
                </div>
                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--text)]">
                  <input
                    id="allowRetakes"
                    name="allowRetakes"
                    type="checkbox"
                    checked={formData.allowRetakes}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  Allow
                </label>
              </div>

              <div className="mt-4 md:max-w-xs">
                <label htmlFor="maxAttempts" className="field-label">
                  Maximum Attempts
                </label>
                <input
                  id="maxAttempts"
                  name="maxAttempts"
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  disabled={submitting || !formData.allowRetakes}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? "Saving Changes..." : "Save Exam Changes"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/teacher")}
                disabled={submitting}
              >
                Done
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="section-title">Editing guidance</h2>
            <p className="section-subtitle mt-2">
              Use this page to keep the exam configuration aligned with how the
              paper is actually being delivered.
            </p>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-[#cbdcf8] bg-[#f8fbff] p-5">
                <p className="stat-label">Tip</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                  Review timing carefully
                </p>
                <p className="section-subtitle">
                  Changing the duration will affect future exam sessions, so
                  keep it aligned with your instructions.
                </p>
              </div>

              <div className="rounded-2xl border border-[#cbdcf8] bg-[#f8fbff] p-5">
                <p className="stat-label">Tip</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                  Publish only when ready
                </p>
                <p className="section-subtitle">
                  The publish toggle controls whether students can access the
                  exam from their dashboard.
                </p>
              </div>

              <div className="rounded-2xl border border-[#cbdcf8] bg-[#f8fbff] p-5">
                <p className="stat-label">Tip</p>
                <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                  Retakes affect attempt limits
                </p>
                <p className="section-subtitle">
                  Increasing or reducing attempts changes how many times
                  students may retry this exam.
                </p>
              </div>
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="section-title">Live preview</h2>
            <p className="section-subtitle mt-2">
              This preview updates as you edit the exam details.
            </p>

            <div className="exam-card teacher-exam-card mt-5">
              <div className="teacher-card-top">
                <div>
                  <h3 className="section-title">
                    {formData.title.trim() || "Untitled exam"}
                  </h3>
                  <p className="section-subtitle">
                    {formData.description.trim() ||
                      "Your exam description will appear here once updated."}
                  </p>
                </div>
                <span className="teacher-code-pill">
                  {formData.examCode || "No code"}
                </span>
              </div>

              <div className="exam-card-meta mt-5">
                <div className="meta-row">
                  <span>Duration</span>
                  <strong>{formData.duration || "0"} minutes</strong>
                </div>
                <div className="meta-row">
                  <span>Total Marks</span>
                  <strong>{formData.totalMarks || "0"}</strong>
                </div>
                <div className="meta-row">
                  <span>Publish Status</span>
                  <strong>{formData.isPublished ? "Published" : "Draft"}</strong>
                </div>
                <div className="meta-row">
                  <span>Retakes</span>
                  <strong>
                    {formData.allowRetakes
                      ? `${formData.maxAttempts || "1"} attempts`
                      : "Single attempt only"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EditExam;
