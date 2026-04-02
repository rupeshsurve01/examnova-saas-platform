import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const createInitialForm = () => ({
  title: "",
  description: "",
  duration: "60",
  totalMarks: "100",
  examCode: "",
});

const generateExamCode = () =>
  `EXAM-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now()
    .toString()
    .slice(-3)}`;

function CreateExam() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [formData, setFormData] = useState(() => ({
    ...createInitialForm(),
    examCode: generateExamCode(),
  }));
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        value: "Draft",
      },
    ],
    [formData.duration, formData.totalMarks],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      ...createInitialForm(),
      examCode: generateExamCode(),
    });
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      duration: Number(formData.duration),
      totalMarks: Number(formData.totalMarks),
      examCode: formData.examCode.trim().toUpperCase(),
    };

    if (
      !payload.title ||
      !payload.description ||
      !payload.examCode ||
      Number.isNaN(payload.duration) ||
      payload.duration <= 0 ||
      Number.isNaN(payload.totalMarks) ||
      payload.totalMarks <= 0
    ) {
      setErrorMessage(
        "Enter a title, description, exam code, and valid positive numbers for duration and total marks.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await API.post("/exams/create", payload);
      navigate("/add-questions", {
        state: {
          examId: response.data.exam._id,
        },
      });
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "Unauthorized") {
        logout();
        navigate("/");
        return;
      }

      setErrorMessage(message || "Unable to create this exam.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell teacher-shell">
      <div className="container-card teacher-dashboard-card mx-auto max-w-6xl overflow-hidden">
        <header className="topbar">
          <div>
            <div className="brand">ExamNova</div>
            <p className="text-sm text-[var(--muted)]">Exam creation</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-[var(--muted)]">
              {user?.name ? `Logged in as ${user.name}` : "Teacher workspace"}
            </div>
            <button
              type="button"
              onClick={() => navigate("/teacher")}
              className="secondary-button"
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        <section className="page-header teacher-hero">
          <div>
            <span className="teacher-kicker">Assessment Setup</span>
            <h1 className="page-title">Create a new exam shell</h1>
            <p className="page-subtitle">
              Define the exam details here, then continue to the question
              builder to add the full paper and publish it for students.
            </p>
          </div>

          <div className="teacher-badge-card">
            <p className="stat-label">Exam Code</p>
            <p className="teacher-badge-value">{formData.examCode || "Pending"}</p>
            <p className="section-subtitle">
              Share this code later with students after the exam is fully ready.
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

        <section className="grid gap-6 p-6 pt-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel p-6">
            <div>
              <h2 className="section-title">Exam details</h2>
              <p className="section-subtitle">
                Add the core information teachers and students will rely on
                before any questions are written.
              </p>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
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
                  placeholder="Midterm Mathematics Assessment"
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
                  placeholder="Summarize the scope, audience, or instructions for this exam"
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
                    placeholder="60"
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
                    placeholder="100"
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
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    id="examCode"
                    name="examCode"
                    type="text"
                    className="form-input"
                    placeholder="EXAM-AB12"
                    value={formData.examCode}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((current) => ({
                        ...current,
                        examCode: generateExamCode(),
                      }))
                    }
                    className="secondary-button whitespace-nowrap"
                    disabled={submitting}
                  >
                    Generate Code
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting ? "Creating Exam..." : "Create Exam"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="panel p-6">
              <h2 className="section-title">What happens next</h2>
              <p className="section-subtitle mt-2">
                After this step, we route directly into question authoring so
                you can finish the exam without losing momentum.
              </p>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-[#cbdcf8] bg-[#f8fbff] p-5">
                  <p className="stat-label">Step 1</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                    Create draft exam
                  </p>
                  <p className="section-subtitle">
                    Save the title, timing, marks, and code for the assessment.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#cbdcf8] bg-[#f8fbff] p-5">
                  <p className="stat-label">Step 2</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                    Add questions
                  </p>
                  <p className="section-subtitle">
                    Build the question bank, set correct answers, and review the
                    exam content.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#cbdcf8] bg-[#f8fbff] p-5">
                  <p className="stat-label">Step 3</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                    Publish when ready
                  </p>
                  <p className="section-subtitle">
                    Make the assessment available to students only after final
                    review.
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <h2 className="section-title">Draft preview</h2>
              <p className="section-subtitle mt-2">
                A quick snapshot of the exam configuration you are about to
                create.
              </p>

              <div className="exam-card teacher-exam-card mt-5">
                <div className="teacher-card-top">
                  <div>
                    <h3 className="section-title">
                      {formData.title.trim() || "Untitled exam"}
                    </h3>
                    <p className="section-subtitle">
                      {formData.description.trim() ||
                        "Your exam description will appear here once entered."}
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
                    <strong>Draft</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CreateExam;
