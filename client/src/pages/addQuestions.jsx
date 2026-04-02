import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const optionLabels = ["A", "B", "C", "D"];

const createEmptyForm = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "A",
  marks: "1",
});

function AddQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(
    location.state?.examId || "",
  );
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState(createEmptyForm);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchTeacherExams = async () => {
      if (!user?.id) {
        setLoadingExams(false);
        setErrorMessage("Please log in again to manage your exams.");
        return;
      }

      try {
        setLoadingExams(true);
        setErrorMessage("");
        const response = await API.get(`/exams/teacher/${user.id}`);
        setExams(response.data || []);
      } catch (error) {
        const message = error.response?.data?.message;

        if (message === "Exams Not Found") {
          setExams([]);
        } else if (message === "Unauthorized") {
          logout();
          navigate("/");
          return;
        } else {
          setErrorMessage(message || "Unable to load your exams.");
        }
      } finally {
        setLoadingExams(false);
      }
    };

    fetchTeacherExams();
  }, [logout, navigate, user?.id]);

  useEffect(() => {
    if (exams.length === 0) {
      return;
    }

    const hasSelectedExam = exams.some((exam) => exam._id === selectedExamId);

    if (!selectedExamId || !hasSelectedExam) {
      setSelectedExamId(location.state?.examId || exams[0]._id);
    }
  }, [exams, location.state?.examId, selectedExamId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedExamId) {
        setQuestions([]);
        return;
      }

      try {
        setLoadingQuestions(true);
        setErrorMessage("");
        const response = await API.get(`/exams/${selectedExamId}/questions`);
        setQuestions(response.data.questions || []);
      } catch (error) {
        const message = error.response?.data?.message;

        if (message === "No questions found for this exam") {
          setQuestions([]);
        } else {
          setErrorMessage(message || "Unable to load questions for this exam.");
        }
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [selectedExamId]);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam._id === selectedExamId),
    [exams, selectedExamId],
  );

  const totalQuestionMarks = questions.reduce(
    (sum, question) => sum + Number(question.marks || 0),
    0,
  );

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData((current) => {
      const updatedOptions = [...current.options];
      updatedOptions[index] = value;

      return {
        ...current,
        options: updatedOptions,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedExamId) {
      setErrorMessage("Choose an exam before adding questions.");
      return;
    }

    const trimmedQuestion = formData.questionText.trim();
    const trimmedOptions = formData.options.map((option) => option.trim());
    const emptyOption = trimmedOptions.find((option) => !option);
    const marks = Number(formData.marks);

    if (!trimmedQuestion) {
      setErrorMessage("Question text is required.");
      return;
    }

    if (emptyOption) {
      setErrorMessage("All four answer options are required.");
      return;
    }

    if (Number.isNaN(marks) || marks <= 0) {
      setErrorMessage("Marks must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await API.post(`/exams/${selectedExamId}/questions`, {
        questionText: trimmedQuestion,
        options: trimmedOptions,
        correctAnswer: optionLabels.indexOf(formData.correctAnswer),
        marks,
      });

      setQuestions((current) => [response.data.question, ...current]);
      setFormData(createEmptyForm());
      setSuccessMessage("Question added successfully.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to add this question.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedExamId) {
      setErrorMessage("Select an exam before publishing.");
      return;
    }

    try {
      setPublishing(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await API.patch(`/exams/${selectedExamId}/publish`);

      setExams((current) =>
        current.map((exam) =>
          exam._id === selectedExamId
            ? { ...exam, isPublished: response.data.exam.isPublished }
            : exam,
        ),
      );
      setSuccessMessage("Exam published successfully.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to publish this exam.",
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="app-shell teacher-shell">
      <div className="container-card mx-auto max-w-7xl overflow-hidden">
        <header className="topbar">
          <div>
            <div className="brand">ExamNova</div>
            <p className="text-sm text-[var(--muted)]">Question builder</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/teacher")}
              className="secondary-button"
              type="button"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate("/exams")}
              className="primary-button"
              type="button"
            >
              Create New Exam
            </button>
          </div>
        </header>

        <section className="page-header teacher-hero">
          <div>
            <span className="teacher-kicker">Question Studio</span>
            <h1 className="page-title">Build the question set for your exam</h1>
            <p className="page-subtitle">
              Add one question at a time, review the answer key, and publish
              when the paper is ready for students.
            </p>
          </div>

          <div className="teacher-badge-card">
            <p className="stat-label">Selected Exam</p>
            <p className="teacher-badge-value">
              {selectedExam?.title || "Choose an exam"}
            </p>
            <p className="section-subtitle">
              {selectedExam
                ? `${selectedExam.duration} minutes | ${selectedExam.totalMarks} total marks`
                : "Pick one of your created exams to start adding questions."}
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-box teacher-stat-box">
              <p className="stat-label">Questions Added</p>
              <p className="stat-value">{questions.length}</p>
            </div>
            <div className="stat-box teacher-stat-box">
              <p className="stat-label">Marks Authored</p>
              <p className="stat-value">{totalQuestionMarks}</p>
            </div>
            <div className="stat-box teacher-stat-box">
              <p className="stat-label">Status</p>
              <p className="stat-value">
                {selectedExam?.isPublished ? "Published" : "Draft"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 p-6 pt-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="panel p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="section-title">Exam context</h2>
                  <p className="section-subtitle">
                    Switch between your exams anytime. Questions load for the
                    selected paper.
                  </p>
                </div>

                {exams.length > 0 && (
                  <button
                    onClick={handlePublish}
                    type="button"
                    className="primary-button"
                    disabled={publishing || !selectedExamId || selectedExam?.isPublished}
                  >
                    {publishing
                      ? "Publishing..."
                      : selectedExam?.isPublished
                        ? "Published"
                        : "Publish Exam"}
                  </button>
                )}
              </div>

              {loadingExams ? (
                <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
                  Loading your exams...
                </div>
              ) : exams.length === 0 ? (
                <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <h3 className="section-title text-lg">No exams available yet</h3>
                  <p className="section-subtitle">
                    Create an exam first, then come back here to write the
                    question set.
                  </p>
                  <button
                    onClick={() => navigate("/exams")}
                    type="button"
                    className="primary-button mt-4"
                  >
                    Create Exam
                  </button>
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  <div>
                    <label htmlFor="exam-select" className="field-label">
                      Select Exam
                    </label>
                    <select
                      id="exam-select"
                      className="form-input"
                      value={selectedExamId}
                      onChange={(event) => {
                        setSelectedExamId(event.target.value);
                        setSuccessMessage("");
                        setErrorMessage("");
                      }}
                    >
                      {exams.map((exam) => (
                        <option key={exam._id} value={exam._id}>
                          {exam.title} ({exam.examCode || "No code"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedExam && (
                    <div className="grid gap-4 rounded-2xl border border-[#cbdcf8] bg-[#f8fbff] p-5 md:grid-cols-3">
                      <div>
                        <p className="stat-label">Exam Code</p>
                        <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                          {selectedExam.examCode || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="stat-label">Duration</p>
                        <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                          {selectedExam.duration} min
                        </p>
                      </div>
                      <div>
                        <p className="stat-label">Target Marks</p>
                        <p className="mt-2 text-lg font-semibold text-[var(--text)]">
                          {selectedExam.totalMarks}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="panel p-6">
              <div>
                <h2 className="section-title">Add a new question</h2>
                <p className="section-subtitle">
                  Keep options concise and mark the single correct answer for
                  scoring.
                </p>
              </div>

              {errorMessage ? (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="form-grid mt-5">
                <div>
                  <label htmlFor="questionText" className="field-label">
                    Question Text
                  </label>
                  <textarea
                    id="questionText"
                    name="questionText"
                    rows="5"
                    className="form-input resize-y"
                    placeholder="Write the full question prompt here"
                    value={formData.questionText}
                    onChange={handleFieldChange}
                    disabled={!selectedExamId || submitting}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {formData.options.map((option, index) => (
                    <div key={optionLabels[index]}>
                      <label
                        htmlFor={`option-${optionLabels[index]}`}
                        className="field-label"
                      >
                        Option {optionLabels[index]}
                      </label>
                      <input
                        id={`option-${optionLabels[index]}`}
                        type="text"
                        className="form-input"
                        placeholder={`Enter option ${optionLabels[index]}`}
                        value={option}
                        onChange={(event) =>
                          handleOptionChange(index, event.target.value)
                        }
                        disabled={!selectedExamId || submitting}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="correctAnswer" className="field-label">
                      Correct Answer
                    </label>
                    <select
                      id="correctAnswer"
                      name="correctAnswer"
                      className="form-input"
                      value={formData.correctAnswer}
                      onChange={handleFieldChange}
                      disabled={!selectedExamId || submitting}
                    >
                      {optionLabels.map((label) => (
                        <option key={label} value={label}>
                          Option {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="marks" className="field-label">
                      Marks
                    </label>
                    <input
                      id="marks"
                      name="marks"
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="Question marks"
                      value={formData.marks}
                      onChange={handleFieldChange}
                      disabled={!selectedExamId || submitting}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={!selectedExamId || submitting}
                  >
                    {submitting ? "Saving Question..." : "Add Question"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setFormData(createEmptyForm());
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    disabled={submitting}
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex flex-col gap-2">
              <h2 className="section-title">Question bank</h2>
              <p className="section-subtitle">
                Review what students will see before you publish the exam.
              </p>
            </div>

            {loadingQuestions ? (
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
                Loading questions for this exam...
              </div>
            ) : questions.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center">
                <h3 className="section-title text-lg">No questions yet</h3>
                <p className="section-subtitle">
                  Your first question will appear here as soon as you save it.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {questions.map((question, index) => (
                  <article
                    key={question._id}
                    className="rounded-2xl border border-[#dbe6f6] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="question-number">Question {index + 1}</p>
                        <h3 className="section-title mt-2 text-lg">
                          {question.questionText}
                        </h3>
                      </div>
                      <span className="teacher-code-pill">
                        {question.marks} mark{Number(question.marks) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {question.options.map((option, optionIndex) => {
                        const isCorrect =
                          question.correctAnswer === optionIndex;

                        return (
                          <div
                            key={`${question._id}-${optionIndex}`}
                            className={`option-card ${isCorrect ? "option-card-selected" : ""}`}
                          >
                            <span className="option-badge">
                              {optionLabels[optionIndex]}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-[var(--text)]">
                                {option}
                              </p>
                              <p className="text-sm text-[var(--muted)]">
                                {isCorrect ? "Correct answer" : "Distractor option"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AddQuestions;
