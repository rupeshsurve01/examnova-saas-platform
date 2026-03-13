import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function ResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/attempts/${attemptId}`);
      setResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!result)
    return <h2 className="text-center mt-20 text-xl">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white shadow-lg rounded-xl p-10 text-center w-96">

        <h1 className="text-2xl font-bold mb-6">Exam Result</h1>

        <div className="space-y-3 text-lg">

          <p>
            <span className="font-semibold">Score:</span> {result.score}
          </p>

          <p>
            <span className="font-semibold">Total Questions:</span>{" "}
            {result.totalQuestions}
          </p>

          <p>
            <span className="font-semibold">Correct Answers:</span>{" "}
            {result.correctAnswers}
          </p>

        </div>

      </div>

    </div>
  );
}

export default ResultPage;