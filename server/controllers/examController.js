const Attempt = require("../models/Attempt");
const Question = require("../models/Question");
const Exam = require("../models/Exam");

const createExam = async (req, res) => {
  try {
    const { title, description, totalMarks, duration, examCode } = req.body;

    if (!title || !description || !totalMarks || !duration || !examCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingExam = await Exam.findOne({ examCode });

    if (existingExam) {
      return res.status(400).json({ message: "Exam code already exists" });
    }

    const exam = await Exam.create({
      title,
      description,
      totalMarks,
      duration,
      examCode,
      createdBy: req.body.createdBy // temporary until JWT auth added
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam
    });

  } catch (error) {
  console.error(error);
  res.status(500).json({ message: error.message });
}
};

const publishExam = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam ID is required" });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    exam.isPublished = true;
    await exam.save();

    res.status(200).json({
      message: "Exam published successfully",
      exam
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


const submitExam = async (req, res) => {
  try {

    const { examId } = req.params;
    const { studentId, answers } = req.body;

    if (!examId || !studentId || !answers) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const attempt = await Attempt.findOne({ examId, studentId });

    if (!attempt) {
      return res.status(404).json({ message: "Exam not started" });
    }

    const startTime = new Date(attempt.startedAt);
    const now = new Date();

    const elapsedMinutes = (now - startTime) / 60000;

    if (elapsedMinutes > exam.duration) {
      return res.status(403).json({
        message: "Exam time exceeded"
      });
    }

    const questions = await Question.find({ examId });

    let score = 0;

    answers.forEach((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (question && question.correctAnswer === answer.selectedOption) {
        score += question.marks;
      }
    });

    attempt.answers = answers;
    attempt.score = score;

    await attempt.save();

    res.status(200).json({
      message: "Exam submitted successfully",
      score
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAvailableExams = async (req, res) => {
  try {
    const exams = await Exam.find({ isPublished: true })
      .select("title description duration totalMarks examCode");

    res.status(200).json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getCreatedExam = async (req, res) => {
  try {

    const teacherId = req.params.teacherId;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher Id Required" });
    }

    const exams = await Exam.find({ createdBy: teacherId });

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: "Exams Not Found" });
    }

    res.status(200).json(exams);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { createExam, publishExam, submitExam, getAvailableExams, getCreatedExam };