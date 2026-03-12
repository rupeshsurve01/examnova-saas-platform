const express = require("express");
const {
  createExam,
  publishExam,
  getAvailableExams,
  submitExam,
  getCreatedExam
} = require("../controllers/examController");

const {
  addQuestions,
  getExamQuestions
} = require("../controllers/questionController");

const {
  attemptedQuestions,
  getStudentResult,
  getExamAttempts,
  startExam
} = require("../controllers/attemptController");

const router = express.Router();

// ---------- LIST ROUTES FIRST ----------
router.get("/", getAvailableExams);
router.get("/teacher/:teacherId", getCreatedExam);

// ---------- CREATE ----------
router.post("/create", createExam);

// ---------- EXAM ACTIONS ----------
router.patch("/:examId/publish", publishExam);
router.post("/:examId/start", startExam);
router.post("/:examId/submit", submitExam);

// ---------- QUESTIONS ----------
router.post("/:examId/questions", addQuestions);
router.get("/:examId/questions", getExamQuestions);

// ---------- RESULTS ----------
router.get("/:examId/result/:studentId", getStudentResult);
router.get("/:examId/attempts", getExamAttempts);

module.exports = router;