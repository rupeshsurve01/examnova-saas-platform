import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import QuestionCard from "../components/QuestionCard";
import ExamTimer from "../components/ExamTimer";
import { useAuth } from "../context/AuthContext";

function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);
  const [examDuration, setExamDuration] = useState(null);
  const [examTitle, setExamTitle] = useState("Online Exam");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExamData = useCallback(async () => {
    try {
      setLoading(true);
      const [questionsResponse, attemptResponse] = await Promise.all([
        API.get(`/exams/${examId}/questions`),
        API.get(`/exams/${examId}/attempt`),
      ]);

      const fetchedAttempt = attemptResponse.data;
      const durationInMinutes = Number(fetchedAttempt?.examId?.duration) || 0;
      const startedAt = fetchedAttempt?.startedAt
        ? new Date(fetchedAttempt.startedAt)
        : null;
      const endTime = startedAt
        ? startedAt.getTime() + durationInMinutes * 60 * 1000
        : null;

      if (fetchedAttempt?.submittedAt) {
        navigate(`/result/${examId}/${user?.id || fetchedAttempt.studentId}`);
        return;
      }

      if (endTime && endTime <= Date.now()) {
        alert("This exam attempt has already expired.");
        navigate("/dashboard");
        return;
      }

      setQuestions(questionsResponse.data.questions || []);
      setAttempt(fetchedAttempt);
      setExamDuration(durationInMinutes || null);
      setExamTitle(fetchedAttempt?.examId?.title || "Online Exam");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to load your exam. Please try again.",
      );
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [examId, navigate]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionIndex,
    }));
  };

  const submitExam = useCallback(async () => {
    try {
      if (isSubmitting) {
        return;
      }

      if (!user?.id) {
        alert("Please login again to submit the exam.");
        logout();
        navigate("/");
        return;
      }

      setIsSubmitting(true);

      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        selectedOption: answers[questionId],
      }));

      await API.post(`/exams/${examId}/submit`, {
        answers: formattedAnswers,
      });

      navigate(`/result/${examId}/${user.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit exam");
      setIsSubmitting(false);
    }
  }, [answers, examId, isSubmitting, logout, navigate, user?.id]);

  return (
    <div className="app-shell">
      <div className="mx-auto max-w-5xl">
        <div className="container-card overflow-hidden">
          <header className="topbar exam-topbar">
            <div>
              <div className="brand">ExamNova</div>
              <p className="text-sm text-[var(--muted)]">
                {attempt?.examId?.examCode
                  ? `Exam interface • ${attempt.examId.examCode}`
                  : "Exam interface"}
              </p>
            </div>
            <div className="exam-topbar-status">
              <div className="text-sm text-[var(--muted)]">
                Questions answered: {Object.keys(answers).length}/{questions.length}
              </div>
              {attempt?.startedAt && examDuration ? (
                <ExamTimer
                  startedAt={attempt.startedAt}
                  duration={examDuration}
                  onTimeUp={submitExam}
                />
              ) : null}
            </div>
          </header>

          <section className="page-header">
            <div>
              <h1 className="page-title">{examTitle}</h1>
              <p className="page-subtitle">
                Read each question carefully and select the best answer before
                time runs out.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <p className="stat-label">Total Questions</p>
                <p className="stat-value">{questions.length}</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Answered</p>
                <p className="stat-value">{Object.keys(answers).length}</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Duration</p>
                <p className="stat-value">
                  {examDuration ? `${examDuration} min` : "--"}
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 pt-0">
            {loading ? (
              <div className="panel p-8 text-center">
                <h2 className="section-title">Loading questions</h2>
                <p className="section-subtitle">
                  Please wait while the exam questions are loaded.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((q, index) => (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    index={index}
                    handleAnswer={handleAnswer}
                    selected={answers[q._id]}
                  />
                ))}
              </div>
            )}

            <div className="submit-bar mt-6">
              <div>
                <h3 className="section-title text-lg">Submit Exam</h3>
                <p className="section-subtitle">
                  Make sure your selected answers are correct before submission.
                </p>
              </div>

              <button
                onClick={submitExam}
                className="primary-button"
                disabled={loading || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ExamPage;
