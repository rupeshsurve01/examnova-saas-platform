function QuestionCard({ question, index, handleAnswer, selected }) {
  return (
    <div className="question-shell">
      <p className="question-number">Question {index + 1}</p>
      <h3 className="section-title mt-2 text-[1.2rem]">{question.questionText}</h3>

      <div className="mt-5 space-y-3">
        {question.options.map((option, i) => (
          <label
            key={i}
            className={`option-card ${
              selected === i ? "option-card-selected" : ""
            }`}
          >
            <input
              type="radio"
              name={question._id}
              checked={selected === i}
              onChange={() => handleAnswer(question._id, i)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="option-badge">{String.fromCharCode(65 + i)}</span>
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default QuestionCard;
