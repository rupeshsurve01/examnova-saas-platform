const Question = require("../models/Question");

const addQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questionText, options, correctAnswer, marks } = req.body;

    if (!examId || !questionText || !options || correctAnswer === undefined || !marks) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const question = await Question.create({
      examId,
      questionText,
      options,
      correctAnswer,
      marks,
    });

    res.status(201).json({
      message: "Question added successfully",
      question,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "ExamId required" });
    }

    const questions = await Question
      .find({ examId })
      .select("-correctAnswer"); // hide answer from students

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this exam" });
    }

    res.status(200).json({ questions });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { addQuestions, getExamQuestions };