const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const StudentWorkspaceAccess = require("../models/StudentWorkspaceAccess");
const { getIo } = require("../socket");
const { getResultExportQueue } = require("../queues/resultExportQueue");

const getStudentResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID required" });
    }

    const result = await Attempt.findById(attemptId);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const isStudentOwner =
      req.user.role === "student" &&
      result.studentId.toString() === req.user._id.toString();

    if (req.user.role === "student" && !isStudentOwner) {
      return res.status(403).json({ message: "Unauthorized to view result" });
    }

    const exam = await Exam.findById(result.examId).select(
      "title examCode duration totalMarks",
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const questions = await Question.find({ examId: exam._id }).sort({
      createdAt: 1,
    });
    const answersByQuestionId = new Map(
      result.answers.map((answer) => [
        answer.questionId.toString(),
        answer.selectedOption,
      ]),
    );

    const reviewQuestions = questions.map((question, index) => {
      const selectedOption = answersByQuestionId.has(question._id.toString())
        ? answersByQuestionId.get(question._id.toString())
        : null;
      const isCorrect =
        selectedOption !== null && selectedOption === question.correctAnswer;

      return {
        questionId: question._id,
        questionNumber: index + 1,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedOption,
        isCorrect,
        marks: question.marks,
      };
    });

    res.status(200).json({
      attemptId: result._id,
      attemptNumber: result.attemptNumber,
      examId: exam._id,
      examTitle: exam.title,
      examCode: exam.examCode,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      score: result.score,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      totalQuestions: reviewQuestions.length,
      reviewQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getExamAttempts = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam Id Required" });
    }

    const attempts = await Attempt.find({ examId })
      .populate("studentId")
      .sort({ attemptNumber: -1, createdAt: -1 });

    if (attempts.length === 0) {
      return res
        .status(404)
        .json({ message: "No attempts found for this exam" });
    }

    res.status(200).json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getStudentAttempts = async (req, res) => {
  try {
    const studentId =
      req.user.role === "student" ? req.user._id : req.params.studentId;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID required" });
    }

    const attempts = await Attempt.find({ studentId })
      .populate(
        "examId",
        "title examCode duration allowRetakes maxAttempts totalMarks",
      )
      .sort({ createdAt: -1 });

    if (attempts.length === 0) {
      return res.status(404).json({ message: "No attempts found" });
    }

    res.status(200).json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const startExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    if (!examId || !studentId) {
      return res
        .status(400)
        .json({ message: "ExamId and studentId required" });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (!exam.isPublished) {
      return res.status(403).json({ message: "Exam not available" });
    }

    if (exam.isArchived) {
      return res.status(403).json({ message: "Exam not available" });
    }

    const studentAttempts = await Attempt.find({ examId, studentId }).sort({
      attemptNumber: -1,
      createdAt: -1,
    });

    const workspaceAccess = await StudentWorkspaceAccess.findOne({
      studentId,
      teacherId: exam.createdBy,
    });

    if (!workspaceAccess && studentAttempts.length === 0) {
      return res.status(403).json({
        message:
          "Join this teacher workspace with the workspace code before starting this exam",
      });
    }

    const activeAttempt = studentAttempts.find((attempt) => !attempt.submittedAt);

    if (activeAttempt) {
      const elapsedMinutes =
        (Date.now() - new Date(activeAttempt.startedAt).getTime()) / 60000;

      if (elapsedMinutes <= exam.duration) {
        return res.status(400).json({
          message: "Exam already started",
          attempt: activeAttempt,
        });
      }
    }

    const completedOrExpiredAttempts = studentAttempts.length;

    if (!exam.allowRetakes && completedOrExpiredAttempts > 0) {
      return res
        .status(403)
        .json({ message: "Retakes are not allowed for this exam" });
    }

    if (completedOrExpiredAttempts >= exam.maxAttempts) {
      return res.status(403).json({
        message: `Maximum attempts reached for this exam (${exam.maxAttempts})`,
      });
    }

    const nextAttemptNumber =
      studentAttempts.length > 0
        ? Math.max(...studentAttempts.map((attempt) => attempt.attemptNumber)) + 1
        : 1;

    const attempt = await Attempt.create({
      examId,
      studentId,
      attemptNumber: nextAttemptNumber,
      startedAt: new Date(),
    });
    const studentName =
      req.user.name || req.user.email || `Student ${req.user._id.toString()}`;
    const io = getIo();

    if (io) {
      io.to(`teacher:${exam.createdBy.toString()}`).emit("student-started-exam", {
        examId: exam._id.toString(),
        examTitle: exam.title,
        studentId: req.user._id.toString(),
        studentName,
        attemptId: attempt._id.toString(),
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
      });
    }

    res.status(201).json({
      message: "Exam started",
      attempt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getStudentExamAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    if (!examId || !studentId) {
      return res
        .status(400)
        .json({ message: "ExamId and studentId required" });
    }

    const attempts = await Attempt.find({ examId, studentId })
      .populate("examId", "title duration examCode allowRetakes maxAttempts")
      .sort({ attemptNumber: -1, createdAt: -1 });

    if (attempts.length === 0) {
      return res
        .status(404)
        .json({ message: "No attempt found for this exam" });
    }

    const activeAttempt = attempts.find((attempt) => !attempt.submittedAt);
    const latestAttempt = activeAttempt || attempts[0];

    res.status(200).json(latestAttempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const queueExamResultsExport = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam Id Required" });
    }

    const exam = await Exam.findById(examId).select("title createdBy");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const isOrgAdmin = req.user.role === "org_admin";
    const isOwner = exam.createdBy?.toString() === req.user._id.toString();

    if (!isOrgAdmin && !isOwner) {
      return res.status(403).json({ message: "Unauthorized to export results" });
    }

    const resultExportQueue = getResultExportQueue();
    const job = await resultExportQueue.add("generate-exam-results-export", {
      examId: exam._id.toString(),
      examTitle: exam.title,
      requestedBy: req.user._id.toString(),
      requestedAt: new Date().toISOString(),
    });

    return res.status(202).json({
      message: "Results export job queued successfully",
      jobId: job.id,
      status: "queued",
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "Redis is not running. Start Redis before using background exports.",
      });
    }

    return res.status(500).json({ message: "Unable to queue results export" });
  }
};

const getExamResultsExportJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ message: "Job Id Required" });
    }

    const resultExportQueue = getResultExportQueue();
    const job = await resultExportQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ message: "Export job not found" });
    }

    if (job.data.requestedBy !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to view export job" });
    }

    const state = await job.getState();
    const progress = job.progress || 0;
    const result = job.returnvalue || null;
    const failedReason = job.failedReason || null;

    return res.status(200).json({
      jobId: job.id,
      state,
      progress,
      result,
      failedReason,
      createdAt: job.timestamp,
      finishedAt: job.finishedOn || null,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "Redis is not running. Start Redis before checking export jobs.",
      });
    }

    return res.status(500).json({ message: "Unable to load export job status" });
  }
};

module.exports = {
  getStudentResult,
  getExamAttempts,
  getStudentAttempts,
  startExam,
  getStudentExamAttempt,
  queueExamResultsExport,
  getExamResultsExportJobStatus,
};
