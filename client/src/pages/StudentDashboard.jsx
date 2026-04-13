import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [workspaceCode, setWorkspaceCode] = useState("");
  const [joiningWorkspace, setJoiningWorkspace] = useState(false);
  const [workspaceMessage, setWorkspaceMessage] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getAttemptRouteForExam = async (examId) => {
    const attemptResponse = await API.get(`/exams/${examId}/attempt`);
    const attempt = attemptResponse.data;
    const durationInMinutes = Number(attempt?.examId?.duration) || 0;
    const startedAt = attempt?.startedAt ? new Date(attempt.startedAt) : null;
    const endTime = startedAt
      ? startedAt.getTime() + durationInMinutes * 60 * 1000
      : null;

    if (attempt?.submittedAt) {
      return `/result/${attempt._id}`;
    }

    if (endTime && endTime <= Date.now()) {
      throw new Error("This exam attempt has already expired.");
    }

    return `/exam/${examId}`;
  };

  const startExam = async (examId) => {
    try {
      if (!user?.id) {
        alert("Please login again to start the exam.");
        logout();
        navigate("/");
        return;
      }

      await API.post(`/exams/${examId}/start`);
      navigate(`/exam/${examId}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to start the exam";

      if (message === "Exam already started") {
        try {
          const route = await getAttemptRouteForExam(examId);
          navigate(route);
        } catch (attemptError) {
          alert(
            attemptError.response?.data?.message ||
              attemptError.message ||
              "This exam attempt is no longer available.",
          );
        }
        return;
      }
      alert(message);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data);
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "Unauthorized") {
        logout();
        navigate("/");
        return;
      }

      console.error(error);
    }
  };

  const handleJoinWorkspace = async (event) => {
    event.preventDefault();

    const nextWorkspaceCode = workspaceCode.trim().toUpperCase();

    if (!nextWorkspaceCode) {
      setWorkspaceError("Enter the workspace code shared by your teacher.");
      setWorkspaceMessage("");
      return;
    }

    try {
      setJoiningWorkspace(true);
      setWorkspaceError("");
      setWorkspaceMessage("");
      const response = await API.post("/exams/workspace/join", {
        workspaceCode: nextWorkspaceCode,
      });

      setWorkspaceCode("");
      setWorkspaceMessage(
        `Joined ${response.data.teacher?.name || "teacher"}'s workspace.`,
      );
      await fetchExams();
    } catch (error) {
      const message = error.response?.data?.message;

      if (message === "Unauthorized") {
        logout();
        navigate("/");
        return;
      }

      setWorkspaceError(
        message || "Unable to join this workspace.",
      );
    } finally {
      setJoiningWorkspace(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="student-page-shell">
      <section className="page-header student-hero">
        <div>
          <span className="student-kicker">Exam Center</span>
          <h1 className="page-title">Available Exams</h1>
          <p className="page-subtitle">
            Join your teacher's workspace with the code they shared, then start
            exams from that private exam space.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-box student-stat-box">
            <p className="stat-label">Workspace Exams</p>
            <p className="stat-value">{exams.length}</p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Candidate</p>
            <p className="stat-value">{user?.role || "Student"}</p>
          </div>
          <div className="stat-box student-stat-box">
            <p className="stat-label">Portal Status</p>
            <p className="stat-value">Ready</p>
          </div>
        </div>
      </section>

      <section className="student-page-section">
        <div className="panel p-6">
          <div>
            <h2 className="section-title">Join teacher workspace</h2>
            <p className="section-subtitle">
              Enter the workspace code your teacher shared to unlock their
              published exams.
            </p>
          </div>

          <form
            onSubmit={handleJoinWorkspace}
            className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"
          >
            <input
              type="text"
              className="form-input"
              placeholder="Example: TCH-AB12C"
              value={workspaceCode}
              onChange={(event) => {
                setWorkspaceCode(event.target.value.toUpperCase());
                setWorkspaceError("");
                setWorkspaceMessage("");
              }}
              disabled={joiningWorkspace}
            />
            <button
              type="submit"
              className="primary-button"
              disabled={joiningWorkspace}
            >
              {joiningWorkspace ? "Joining..." : "Join Workspace"}
            </button>
          </form>

          {workspaceMessage ? (
            <p className="student-exam-note student-exam-note-active">
              {workspaceMessage}
            </p>
          ) : null}

          {workspaceError ? (
            <p className="student-exam-note student-exam-note-blocked">
              {workspaceError}
            </p>
          ) : null}
        </div>

        {exams.length === 0 ? (
          <div className="panel p-8 text-center">
            <h2 className="section-title">No workspace exams yet</h2>
            <p className="section-subtitle">
              Enter a teacher workspace code above. Published exams from joined
              teachers will appear here.
            </p>
          </div>
        ) : (
          <div className="exam-grid">
            {exams.map((exam) => (
              <article key={exam._id} className="exam-card student-exam-card">
                <h2 className="section-title">{exam.title}</h2>
                <p className="section-subtitle">{exam.description}</p>

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
                  <span>Exam Code</span>
                  <strong>{exam.examCode || "N/A"}</strong>
                </div>
                <div className="meta-row">
                  <span>Attempts</span>
                  <strong>
                    {exam.allowRetakes
                      ? `${exam.maxAttempts || 1} allowed`
                      : "Single attempt"}
                  </strong>
                </div>
                <div className="meta-row">
                  <span>Used Attempts</span>
                  <strong>
                    {exam.usedAttempts || 0} / {exam.maxAttempts || 1}
                  </strong>
                </div>
                <div className="meta-row">
                  <span>Attempts Remaining</span>
                  <strong>{exam.attemptsRemaining ?? exam.maxAttempts ?? 1}</strong>
                </div>
              </div>

                {exam.hasActiveAttempt ? (
                  <p className="student-exam-note student-exam-note-active">
                    You already have an active attempt in progress. Selecting
                    this will resume that exam.
                  </p>
                ) : exam.attemptsRemaining === 0 ? (
                  <p className="student-exam-note student-exam-note-blocked">
                    No attempts remaining for this exam. Contact your teacher
                    if you need another try.
                  </p>
                ) : (
                  <p className="student-exam-note">
                    {exam.allowRetakes
                      ? `${exam.attemptsRemaining} attempt(s) remaining.`
                      : "You have one chance to complete this exam."}
                  </p>
                )}

                <button
                  onClick={() => startExam(exam._id)}
                  className="primary-button mt-6 w-full"
                  disabled={!exam.hasActiveAttempt && exam.attemptsRemaining === 0}
                >
                  {exam.hasActiveAttempt
                    ? "Resume Exam"
                    : exam.attemptsRemaining === 0
                      ? "No Attempts Left"
                      : "Start Exam"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;
