import { useEffect, useState } from "react";
import API from "../services/api";

function StudentDashboard() {
  const [exams, setExams] = useState([]);

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
    <div>
      <h2>Available Exams</h2>

      {exams.map((exam) => (
        <div key={exam._id}>
          <h3>title:{exam.title}</h3>
          <p>{exam.description}</p>
          <p>Duration: {exam.duration} minutes</p>
          <p>Total Marks: {exam.totalMarks}</p>

          <button>Start Exam</button>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;
