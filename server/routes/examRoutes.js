const express = require('express')
const { createExam } = require("../controllers/examController")
const { addQuestions, getExamQuestions } =  require("../controllers/questionController")

const router = express.Router()

router.post("/create", createExam)
router.post("/:examId/questions", addQuestions)
router.get("/:examId/questions", getExamQuestions)

module.exports = router
 