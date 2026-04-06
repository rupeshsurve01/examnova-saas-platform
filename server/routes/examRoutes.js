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
  getExamQuestions,
  updateQuestion,
  deleteQuestion
} = require("../controllers/questionController");

const {
  attemptedQuestions,
  getStudentResult,
  getExamAttempts,
  startExam,
  getStudentExamAttempt
} = require("../controllers/attemptController");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// ---------- LIST ROUTES FIRST ----------
router.get("/", protect, getAvailableExams);
router.get("/teacher/:teacherId", protect, authorize("teacher", "org_admin"), getCreatedExam);

// ---------- CREATE ----------
router.post("/create", protect, authorize("teacher", "org_admin"), createExam);

// ---------- EXAM ACTIONS ----------
router.patch("/:examId/publish", protect, authorize("teacher", "org_admin"), publishExam);
router.post("/:examId/start", protect, authorize("student"), startExam);
router.post("/:examId/submit", protect, authorize("student"), submitExam);

// ---------- QUESTIONS ----------
router.post("/:examId/questions", protect, authorize("teacher", "org_admin"), addQuestions);
router.get("/:examId/questions", protect, authorize("student", "teacher", "org_admin"), getExamQuestions);
router.get("/:examId/attempt", protect, authorize("student"), getStudentExamAttempt);
router.put("/questions/:questionId", protect, authorize("teacher", "org_admin"), updateQuestion);
router.delete("/questions/:questionId", protect, authorize("teacher", "org_admin"), deleteQuestion);

// ---------- RESULTS ----------
router.get("/:examId/result/:studentId", protect, getStudentResult);
router.get("/:examId/attempts", protect, authorize("teacher", "org_admin"), getExamAttempts);

module.exports = router;
