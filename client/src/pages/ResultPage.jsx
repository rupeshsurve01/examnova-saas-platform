import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  if (!result)
    return (
      <h2 className="text-center mt-20 text-xl">
        Loading Result...
      </h2>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white shadow-lg rounded-xl p-10 text-center w-96">

        <h1 className="text-2xl font-bold mb-6">
          Exam Result
        </h1>

        <div className="space-y-3 text-lg">

          <p>
            <span className="font-semibold">Score:</span>{" "}
            {result.score}
          </p>

        </div>

      </div>

    </div>
  );
}

export default ResultPage;