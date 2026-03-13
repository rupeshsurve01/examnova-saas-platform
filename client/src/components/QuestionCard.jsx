function QuestionCard({ question, index, handleAnswer, selected }) {

  return (
    <div className="mb-6 border-b pb-6">

      <h3 className="text-lg font-semibold mb-4">
        {index + 1}. {question.questionText}
      </h3>

      <div className="space-y-2">

        {question.options.map((option, i) => (
          <label
            key={i}
            className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer 
            ${selected === option ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"}`}
          >
            <input
              type="radio"
              name={question._id}
              value={option}
              checked={selected === option}
              onChange={() => handleAnswer(question._id, option)}
            />

            {option}
          </label>
        ))}

      </div>

    </div>
  );
}

export default QuestionCard;