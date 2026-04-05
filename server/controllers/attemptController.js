const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");


const getStudentResult = async (req, res) => {
  try {
    const { examId, studentId } = req.params;
    const requestedStudentId =
      req.user.role === "student" ? req.user._id.toString() : studentId;

    if (!examId || !studentId) {
      return res.status(400).json({ message: "Exam or Student ID required" });
    }

    const result = await Attempt.findOne({
      examId,
      studentId: requestedStudentId,
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const exam = await Exam.findById(examId).select(
      "title examCode duration totalMarks",
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await Question.find({ examId }).sort({ createdAt: 1 });
    const answersByQuestionId = new Map(
      result.answers.map((answer) => [
        answer.questionId.toString(),
        answer.selectedOption,
      ]),
    );

    const reviewQuestions = questions.map((question, index) => {
      const selectedOption = answersByQuestionId.has(question._id.toString())
        ? answersByQuestionId.get(question._id.toString())
        : null;
      const isCorrect =
        selectedOption !== null && selectedOption === question.correctAnswer;

      return {
        questionId: question._id,
        questionNumber: index + 1,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedOption,
        isCorrect,
        marks: question.marks,
      };
    });

    res.status(200).json({
      examId: exam._id,
      examTitle: exam.title,
      examCode: exam.examCode,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      score: result.score,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      totalQuestions: reviewQuestions.length,
      reviewQuestions,
    });
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
    const studentId = req.user.role === "student"
      ? req.user._id
      : req.params.studentId;

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
const studentId = req.user._id;

    if (!examId || !studentId) {
      return res.status(400).json({ message: "ExamId and studentId required" });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!exam.isPublished) {
      return res.status(403).json({ message: "Exam not available" });
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
