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
      setQuestions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const submitExam = async () => {
    try {
      const res = await API.post("/attempts/submit", {
        examId,
        answers,
      });

      navigate(`/result/${res.data.attemptId}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">

        <h1 className="text-2xl font-bold mb-6 text-center">Exam</h1>

        {questions.map((q, index) => (
          <QuestionCard
            key={q._id}
            question={q}
            index={index}
            handleAnswer={handleAnswer}
            selected={answers[q._id]}
          />
        ))}

        <div className="mt-6 text-center">
          <button
            onClick={submitExam}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Submit Exam
          </button>
        </div>

      </div>

    </div>
  );
}

export default ExamPage;