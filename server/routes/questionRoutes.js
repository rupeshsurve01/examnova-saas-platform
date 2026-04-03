const express = require("express");
const {
  addQuestions,
  getExamQuestions,
  updateQuestion,
  deleteQuestion
} = require("../controllers/questionController");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/:examId/questions", protect, authorize("teacher", "org_admin"), addQuestions);
router.get("/:examId/questions", protect, authorize("student", "teacher", "org_admin"), getExamQuestions);
router.put("/:questionId", protect, authorize("teacher", "org_admin"), updateQuestion);
router.delete("/:questionId", protect, authorize("teacher", "org_admin"), deleteQuestion);

module.exports = router;
