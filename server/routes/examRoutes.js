const express = require('express')
const { createExam } = require("../controllers/examController")
const { addQuestions } =  require("../controllers/questionController")

const router = express.Router()

router.post("/create", createExam)
router.post("/:examId/questions", addQuestions)

module.exports = router
 