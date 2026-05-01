const fs = require("fs/promises");
const path = require("path");
const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");

const buildExamExportPayload = async (examId) => {
  const exam = await Exam.findById(examId)
    .populate("createdBy", "name email")
    .lean();

  if (!exam) {
    throw new Error("Exam not found for export");
  }

  const attempts = await Attempt.find({ examId })
    .populate("studentId", "name email")
    .sort({ attemptNumber: 1, createdAt: 1 })
    .lean();

  return {
    exportedAt: new Date().toISOString(),
    exam: {
      id: exam._id.toString(),
      title: exam.title,
      examCode: exam.examCode,
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      createdBy: exam.createdBy
        ? {
            id: exam.createdBy._id.toString(),
            name: exam.createdBy.name,
            email: exam.createdBy.email,
          }
        : null,
    },
    summary: {
      totalAttempts: attempts.length,
      submittedAttempts: attempts.filter((attempt) => attempt.submittedAt).length,
      uniqueStudents: new Set(
        attempts
          .map((attempt) => attempt.studentId?._id?.toString())
          .filter(Boolean),
      ).size,
    },
    attempts: attempts.map((attempt) => ({
      id: attempt._id.toString(),
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      student: attempt.studentId
        ? {
            id: attempt.studentId._id.toString(),
            name: attempt.studentId.name,
            email: attempt.studentId.email,
          }
        : null,
    })),
  };
};

const writeExamExportFile = async ({ examId, payload, jobId }) => {
  const exportsDirectory = path.join(__dirname, "..", "exports");
  await fs.mkdir(exportsDirectory, { recursive: true });

  const safeTitle = (payload.exam.title || "exam")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const fileName = `${safeTitle || "exam"}-${examId}-${jobId}.json`;
  const filePath = path.join(exportsDirectory, fileName);

  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");

  return filePath;
};

module.exports = {
  buildExamExportPayload,
  writeExamExportFile,
};
