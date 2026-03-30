import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

function ResultPage() {
  const { examId, studentId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/exams/${examId}/result/${studentId}`);
      setResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!result) {
    return (
      <div className="app-shell">
        <div className="container-card mx-auto max-w-3xl p-10 text-center">
          <h2 className="section-title">Loading Result</h2>
          <p className="section-subtitle mt-2">
            Please wait while your exam result is being fetched.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="container-card mx-auto max-w-3xl overflow-hidden">
        <header className="topbar">
          <div>
            <div className="brand">ExamNova</div>
            <p className="text-sm text-[var(--muted)]">Exam result</p>
          </div>
        </header>

        <section className="page-header">
          <div>
            <h1 className="page-title">Result Summary</h1>
            <p className="page-subtitle">
              Your exam submission has been recorded successfully.
            </p>
          </div>
        </section>

        <section className="p-6 pt-0">
          <div className="panel p-8">
            <p className="stat-label">Your Score</p>
            <div className="result-score mt-3">{result.score}</div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="stat-box">
                <p className="stat-label">Submission Status</p>
                <p className="stat-value text-[1.2rem]">Recorded</p>
              </div>
              <div className="stat-box">
                <p className="stat-label">Exam ID</p>
                <p className="stat-value text-[1.2rem]">{examId}</p>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="primary-button mt-8 inline-block text-center no-underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResultPage;
