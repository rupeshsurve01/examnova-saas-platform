const express = require('express')
const { createExam } = require("../controllers/examController")

const router = express.Router()

router.post("/create", createExam)

module.exports = router
 