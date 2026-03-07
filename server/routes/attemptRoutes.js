const express = require("express")
const { getStudentAttempts } = require("../controllers/attemptController")

const router = express.Router()

router.get("/:studentId/attempts", getStudentAttempts);

module.exports = router