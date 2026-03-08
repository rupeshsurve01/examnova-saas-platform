const express = require('express')
const { createExam, publishExam, getAvailableExams, submitExam, getCreatedExam } = require("../controllers/examController")
const { addQuestions, getExamQuestions } =  require("../controllers/questionController")
const { attemptedQuestions, getStudentResult, getExamAttempts, startExam } = require('../controllers/attemptController')
const { route } = require('./authRoutes')

const router = express.Router()

router.post("/create", createExam)
router.post("/:examId/questions", addQuestions)
router.get("/:examId/questions", getExamQuestions)
router.post("/:examId/submit", attemptedQuestions)
router.get("/:examId/result/:studentId", getStudentResult)
router.get("/:examId/attempts", getExamAttempts);
router.patch("/:examId/publish", publishExam)
router.post("/:examId/start", startExam)
router.post("/:examId/submit", submitExam)
router.get("/", getAvailableExams)
router.get("/teacher/:teacherId",getCreatedExam)

module.exports = router
