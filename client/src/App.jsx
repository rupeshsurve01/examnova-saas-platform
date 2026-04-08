import Register from "./pages/Register";
import Login from "./pages/Login";
import { Route, Routes } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard";
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateExam from "./pages/createExam";
import AddQuestions from "./pages/addQuestions";
import TeacherLayout from "./components/TeacherLayout";
import StudentLayout from "./components/StudentLayout";
import TeacherResults from "./pages/TeacherResults";
import StudentAttempts from "./pages/StudentAttempts";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/exam/:examId"
        element={
          <ProtectedRoute roles={["student"]}>
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/result/:attemptId" element={<ResultPage />} />
        <Route path="/attempts" element={<StudentAttempts />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={["teacher", "org_admin"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/exams" element={<CreateExam />} />
        <Route path="/add-questions" element={<AddQuestions />} />
        <Route path="/teacher-results/:examId" element={<TeacherResults />} />
      </Route>
    </Routes>
  );
};

export default App;
