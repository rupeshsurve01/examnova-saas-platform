import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import QuestionCard from "../components/QuestionCard";

function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await API.get(`/exams/${examId}/questions`);
      setQuestions(res.data.questions);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const submitExam = async () => {
    try {
      const studentId = localStorage.getItem("userId");

      if (!studentId) {
        alert("Please login again to submit the exam.");
        navigate("/");
        return;
      }

      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        selectedOption: answers[questionId],
      }));

      await API.post(`/exams/${examId}/submit`, {
        studentId,
        answers: formattedAnswers,
      });

      navigate(`/result/${examId}/${studentId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit exam");
    }
  };

  return (
    <div className="app-shell">
      <div className="mx-auto max-w-5xl">
        <div className="container-card overflow-hidden">
          <header className="topbar">
            <div>
              <div className="brand">ExamNova</div>
              <p className="text-sm text-[var(--muted)]">Exam interface</p>
            </div>
            <div className="text-sm text-[var(--muted)]">
              Questions answered: {Object.keys(answers).length}/{questions.length}
            </div>
          </header>

          <section className="page-header">
            <div>
              <h1 className="page-title">Online Exam</h1>
              <p className="page-subtitle">
                Read each question carefully and select the best answer.
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
                <p className="stat-label">Status</p>
                <p className="stat-value">In Progress</p>
              </div>
            </div>
          </section>

          <section className="p-6 pt-0">
            {questions.length === 0 ? (
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

              <button onClick={submitExam} className="primary-button">
                Submit Exam
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ExamPage;
