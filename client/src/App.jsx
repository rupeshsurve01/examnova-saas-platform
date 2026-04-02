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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId"
        element={
          <ProtectedRoute roles={["student"]}>
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result/:examId/:studentId"
        element={
          <ProtectedRoute>
            <ResultPage />
          </ProtectedRoute>
        }
      />

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
      </Route>
    </Routes>
  );
};

export default App;
