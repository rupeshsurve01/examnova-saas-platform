const express = require('express')
const { createExam, publishExam } = require("../controllers/examController")
const { addQuestions, getExamQuestions } =  require("../controllers/questionController")
const { attemptedQuestions, getStudentResult, getExamAttempts } = require('../controllers/attemptController')
const { route } = require('./authRoutes')

const router = express.Router()

router.post("/create", createExam)
router.post("/:examId/questions", addQuestions)
router.get("/:examId/questions", getExamQuestions)
router.post("/:examId/submit", attemptedQuestions)
router.get("/:examId/result/:studentId", getStudentResult)
router.get("/:examId/attempts", getExamAttempts);
router.patch("/:examId/publish", publishExam)
router.post("/:examId/start")
router.post("/:examId/submit")

module.exports = router
 