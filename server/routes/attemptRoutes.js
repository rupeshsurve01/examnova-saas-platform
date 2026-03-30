const express = require("express");
const { getStudentAttempts } = require("../controllers/attemptController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/:studentId/attempts", protect, authorize("student", "teacher", "org_admin"), getStudentAttempts);

module.exports = router;
