import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  const startExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const fetchExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Exams</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>

            <p className="text-gray-600 mb-3">{exam.description}</p>

            <div className="text-sm text-gray-500 mb-4">
              <p>Duration: {exam.duration} minutes</p>
              <p>Total Marks: {exam.totalMarks}</p>
            </div>

            <button
              onClick={() => startExam(exam._id)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Start Exam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;