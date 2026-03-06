const express = require('express')
const { createExam } = require("../controllers/examController")
const { addQuestions, getExamQuestions } =  require("../controllers/questionController")
const { attemptedQuestions, getStudentResult } = require('../controllers/attemptController')

const router = express.Router()

router.post("/create", createExam)
router.post("/:examId/questions", addQuestions)
router.get("/:examId/questions", getExamQuestions)
router.post("/:examId/submit", attemptedQuestions)
router.get("/:examId/result/:studentId", getStudentResult)

module.exports = router
 