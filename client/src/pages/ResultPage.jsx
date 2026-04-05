import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

function ResultPage() {
  const { examId, studentId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/exams/${examId}/result/${studentId}`);
        setResult(res.data);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || "Unable to load your result review.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId, studentId]);

  const correctAnswersCount =
    result?.reviewQuestions?.filter((question) => question.isCorrect).length ||
    0;
  const unansweredCount =
    result?.reviewQuestions?.filter(
      (question) =>
        question.selectedOption === null ||
        question.selectedOption === undefined,
    ).length || 0;
  const incorrectAnswersCount =
    (result?.totalQuestions || 0) - correctAnswersCount - unansweredCount;

  if (loading) {
    return (
      <div className="student-page-shell">
        <div className="panel p-10 text-center">
          <h2 className="section-title">Loading Result</h2>
          <p className="section-subtitle mt-2">
            Please wait while your exam result is being fetched.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !result) {
    return (
      <div className="student-page-shell">
        <div className="panel p-10 text-center">
          <h2 className="section-title">Unable to load result</h2>
          <p className="section-subtitle mt-2">
            {errorMessage || "Something went wrong while loading the result."}
          </p>
          <Link
            to="/attempts"
            className="primary-button mt-8 inline-block text-center no-underline"
          >
            Back to Attempts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page-shell">
      <section className="page-header student-hero">
        <div>
          <span className="student-kicker">Result Center</span>
          <h1 className="page-title">{result.examTitle || "Result Summary"}</h1>
          <p className="page-subtitle">
            Review your score, exam details, and every answer from this
            submission.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-box student-stat-box">
            <p className="stat-label">Your Score</p>
            <div className="result-score mt-3">{result.score}</div>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Exam Code</p>
            <p className="stat-value text-[1.2rem]">
              {result.examCode || "N/A"}
            </p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Total Questions</p>
            <p className="stat-value text-[1.2rem]">
              {result.totalQuestions || 0}
            </p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Correct Answers</p>
            <span className="result-summary-badge result-summary-badge-correct">
              Correct
            </span>
            <p className="stat-value text-[1.2rem]">
              {correctAnswersCount} / {result.totalQuestions || 0}
            </p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Incorrect Answers</p>
            <span className="result-summary-badge result-summary-badge-incorrect">
              Incorrect
            </span>
            <p className="stat-value text-[1.2rem]">{incorrectAnswersCount}</p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Not Answered</p>
            <span className="result-summary-badge result-summary-badge-unanswered">
              Not Answered
            </span>
            <p className="stat-value text-[1.2rem]">{unansweredCount}</p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Submitted At</p>
            <p className="stat-value text-[1.1rem]">
              {result.submittedAt
                ? new Date(result.submittedAt).toLocaleString()
                : "Not submitted"}
            </p>
          </div>
        </div>
      </section>

      <section className="student-page-section">
        <div className="panel p-8">
          <div className="result-summary-top">
            <div>
              <h2 className="section-title">Answer Review</h2>
              <p className="section-subtitle">
                See each question, your selected answer, and the correct
                answer.
              </p>
            </div>
            <Link
              to="/attempts"
              className="secondary-button inline-block text-center no-underline"
            >
              Back to Attempts
            </Link>
          </div>

          <div className="result-review-list">
            {result.reviewQuestions?.map((question) => {
              const selectedLabel =
                question.selectedOption !== null &&
                question.selectedOption !== undefined
                  ? optionLabels[question.selectedOption] ||
                    `Option ${question.selectedOption + 1}`
                  : "Not Answered";
              const correctLabel =
                optionLabels[question.correctAnswer] ||
                `Option ${question.correctAnswer + 1}`;
              const statusText =
                question.selectedOption === null ||
                question.selectedOption === undefined
                  ? "Not Answered"
                  : question.isCorrect
                    ? "Correct"
                    : "Incorrect";

              return (
                <article
                  key={question.questionId}
                  className={`result-review-card ${
                    question.selectedOption === null ||
                    question.selectedOption === undefined
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
                      <h3 className="section-title mt-2">
                        {question.questionText}
                      </h3>
                    </div>
                    <span
                      className={`result-status-pill ${
                        question.selectedOption === null ||
                        question.selectedOption === undefined
                          ? "result-status-pill-unanswered"
                          : question.isCorrect
                            ? "result-status-pill-correct"
                            : "result-status-pill-incorrect"
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>

                  <div className="result-options-list">
                    {question.options.map((option, index) => {
                      const isSelected = question.selectedOption === index;
                      const isCorrect = question.correctAnswer === index;

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
                            {optionLabels[index] || index + 1}
                          </span>
                          <div className="result-option-copy">
                            <p>{option}</p>
                            <div className="result-option-tags">
                              {isSelected && (
                                <span className="result-option-tag result-option-tag-selected">
                                  Your Answer
                                </span>
                              )}
                              {isCorrect && (
                                <span className="result-option-tag result-option-tag-correct">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="result-answer-summary">
                    <div className="stat-box student-stat-box">
                      <p className="stat-label">Your Answer</p>
                      <p className="result-answer-value">{selectedLabel}</p>
                    </div>
                    <div className="stat-box student-stat-box">
                      <p className="stat-label">Correct Answer</p>
                      <p className="result-answer-value">{correctLabel}</p>
                    </div>
                    <div className="stat-box student-stat-box">
                      <p className="stat-label">Marks</p>
                      <p className="result-answer-value">{question.marks}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResultPage;
