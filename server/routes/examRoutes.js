const express = require("express");
const {
  createExam,
  archiveExam,
  deleteExam,
  getExamById,
  getTeacherWorkspaceCode,
  joinTeacherWorkspace,
  publishExam,
  updateExam,
  updateExamRetakeSettings,
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
router.get("/workspace/code", protect, authorize("teacher"), getTeacherWorkspaceCode);
router.post("/workspace/join", protect, authorize("student"), joinTeacherWorkspace);
router.get("/:examId", protect, authorize("teacher", "org_admin"), getExamById);

// ---------- CREATE ----------
router.post("/create", protect, authorize("teacher", "org_admin"), createExam);

// ---------- EXAM ACTIONS ----------
router.patch("/:examId", protect, authorize("teacher", "org_admin"), updateExam);
router.patch("/:examId/archive", protect, authorize("teacher", "org_admin"), archiveExam);
router.patch("/:examId/publish", protect, authorize("teacher", "org_admin"), publishExam);
router.patch("/:examId/retake-settings", protect, authorize("teacher", "org_admin"), updateExamRetakeSettings);
router.delete("/:examId", protect, authorize("teacher", "org_admin"), deleteExam);
router.post("/:examId/start", protect, authorize("student"), startExam);
router.post("/:examId/submit", protect, authorize("student"), submitExam);

// ---------- QUESTIONS ----------
router.post("/:examId/questions", protect, authorize("teacher", "org_admin"), addQuestions);
router.get("/:examId/questions", protect, authorize("student", "teacher", "org_admin"), getExamQuestions);
router.get("/:examId/attempt", protect, authorize("student"), getStudentExamAttempt);
router.put("/questions/:questionId", protect, authorize("teacher", "org_admin"), updateQuestion);
router.delete("/questions/:questionId", protect, authorize("teacher", "org_admin"), deleteQuestion);

// ---------- RESULTS ----------
router.get("/attempts/:attemptId/result", protect, getStudentResult);
router.get("/:examId/attempts", protect, authorize("teacher", "org_admin"), getExamAttempts);

module.exports = router;
