const Attempt = require("../models/Attempt");
const Question = require("../models/Question");


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

const startExam = async (req, res) => {
  try {

    const { examId } = req.params;
    const { studentId } = req.body;

    if (!examId || !studentId) {
      return res.status(400).json({ message: "ExamId and studentId required" });
    }

    const existingAttempt = await Attempt.findOne({ examId, studentId });

    if (existingAttempt) {
      return res.status(400).json({ message: "Exam already started" });
    }

    const attempt = await Attempt.create({
      examId,
      studentId,
      startedAt: new Date()
    });

    res.status(201).json({
      message: "Exam started",
      attempt
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports = {
  getStudentResult,
  getExamAttempts,
  getStudentAttempts,
  startExam
};