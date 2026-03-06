const Attempt = require("../models/Attempt");

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
        .json({ message: "You have already attempted this exam" });
    }

    const attempt = await Attempt.create({
      examId,
      studentId,
      answers,
    });

    res.status(201).json({
      message: "Exam submitted successfully",
      attempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { attemptedQuestions };
