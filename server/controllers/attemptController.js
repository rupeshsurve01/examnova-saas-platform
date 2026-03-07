const Attempt = require("../models/Attempt");
const Question = require("../models/Question");

const attemptedQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, answers } = req.body;

    if (!examId || !studentId || !answers) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAttempt = await Attempt.findOne({ examId, studentId });
    if (existingAttempt) {
      return res
        .status(400)
        .json({ message: "You already attempted this exam" });
    }

    const questions = await Question.find({ examId }).select(
      "correctAnswer marks",
    );

    let score = 0;

    answers.forEach((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId,
      );

      if (question && question.correctAnswer === answer.selectedOption) {
        score += question.marks;
      }
    });

    const attempt = await Attempt.create({
      examId,
      studentId,
      answers,
      score,
    });

    res.status(201).json({
      message: "Exam submitted successfully",
      score,
      attempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getStudentResult = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    if (!examId || !studentId) {
      return res.status(400).json({ message: "Exam or Student ID required" });
    }

    const result = await Attempt.findOne({ examId, studentId });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getExamAttempts = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam Id Required" });
    }

    const attempts = await Attempt.find({ examId }).populate("studentId");

    if (attempts.length === 0) {
      return res.status(404).json({ message: "No attempts found for this exam" });
    }

    res.status(200).json(attempts);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getStudentAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID required" });
    }

    const attempts = await Attempt
      .find({ studentId })
      .populate("examId", "title examCode duration");

    if (attempts.length === 0) {
      return res.status(404).json({ message: "No attempts found" });
    }

    res.status(200).json(attempts);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  attemptedQuestions,
  getStudentResult,
  getExamAttempts,
  getStudentAttempts
};