const Attempt = require("../models/Attempt");
const Question = require("../models/Question");
const Exam = require("../models/Exam");

const getAuthorizedExam = async (examId, user) => {
  const exam = await Exam.findById(examId);

  if (!exam) {
    return { status: 404, body: { message: "Exam not found" } };
  }

  const isOrgAdmin = user?.role === "org_admin";
  const isOwner =
    exam.createdBy && exam.createdBy.toString() === user?._id?.toString();

  if (!isOrgAdmin && !isOwner) {
    return {
      status: 403,
      body: { message: "Unauthorized to modify this exam" },
    };
  }

  return { exam };
};

const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      totalMarks,
      duration,
      examCode,
      allowRetakes,
      maxAttempts,
      organizationId,
    } = req.body;
    const createdBy = req.user._id;
    const orgIdFromUser = req.user.organizationId || null;

    if (
      !title ||
      !description ||
      !totalMarks ||
      !duration ||
      !examCode
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingExam = await Exam.findOne({ examCode });

    if (existingExam) {
      return res.status(400).json({ message: "Exam code already exists" });
    }

    const exam = await Exam.create({
      title,
      description,
      totalMarks,
      duration,
      examCode,
      allowRetakes: Boolean(allowRetakes),
      maxAttempts:
        allowRetakes === true || allowRetakes === "true"
          ? Number(maxAttempts) || 1
          : 1,
      createdBy,
      organizationId: orgIdFromUser || organizationId || undefined,
      isArchived: false,
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getExamById = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam ID is required" });
    }

    const authorization = await getAuthorizedExam(examId, req.user);

    if (authorization.status) {
      return res.status(authorization.status).json(authorization.body);
    }

    const { exam } = authorization;
    const attempts = await Attempt.find({ examId }).select(
      "studentId attemptNumber submittedAt",
    );
    const uniqueStudents = new Set(
      attempts.map((attempt) => attempt.studentId?.toString()).filter(Boolean),
    ).size;
    const maxAttemptNumber = attempts.reduce((highest, attempt) => {
      const nextAttemptNumber = Number(attempt.attemptNumber) || 1;
      return nextAttemptNumber > highest ? nextAttemptNumber : highest;
    }, 0);

    return res.status(200).json({
      ...exam.toObject(),
      attemptInsights: {
        totalAttempts: attempts.length,
        uniqueStudents,
        maxAttemptNumber,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const updateExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
      title,
      description,
      totalMarks,
      duration,
      examCode,
      allowRetakes,
      maxAttempts,
      isPublished,
    } = req.body;

    if (
      !examId ||
      !title ||
      !description ||
      !totalMarks ||
      !duration ||
      !examCode ||
      typeof allowRetakes !== "boolean" ||
      typeof isPublished !== "boolean"
    ) {
      return res.status(400).json({ message: "All exam fields are required" });
    }

    const nextDuration = Number(duration);
    const nextTotalMarks = Number(totalMarks);
    const nextMaxAttempts = allowRetakes ? Number(maxAttempts) : 1;
    const normalizedExamCode = examCode.trim().toUpperCase();

    if (
      Number.isNaN(nextDuration) ||
      nextDuration <= 0 ||
      Number.isNaN(nextTotalMarks) ||
      nextTotalMarks <= 0 ||
      Number.isNaN(nextMaxAttempts) ||
      !Number.isInteger(nextMaxAttempts) ||
      nextMaxAttempts <= 0
    ) {
      return res.status(400).json({
        message:
          "Duration, total marks, and maximum attempts must be valid positive values",
      });
    }

    const authorization = await getAuthorizedExam(examId, req.user);

    if (authorization.status) {
      return res.status(authorization.status).json(authorization.body);
    }

    const existingExam = await Exam.findOne({
      examCode: normalizedExamCode,
      _id: { $ne: examId },
    });

    if (existingExam) {
      return res.status(400).json({ message: "Exam code already exists" });
    }

    const { exam } = authorization;

    if (exam.isArchived) {
      return res.status(400).json({
        message: "Archived exams cannot be edited until they are restored",
      });
    }

    exam.title = title.trim();
    exam.description = description.trim();
    exam.duration = nextDuration;
    exam.totalMarks = nextTotalMarks;
    exam.examCode = normalizedExamCode;
    exam.allowRetakes = allowRetakes;
    exam.maxAttempts = allowRetakes ? nextMaxAttempts : 1;
    exam.isPublished = isPublished;

    await exam.save();

    return res.status(200).json({
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const publishExam = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam ID is required" });
    }

    const authorization = await getAuthorizedExam(examId, req.user);

    if (authorization.status) {
      return res.status(authorization.status).json(authorization.body);
    }

    const { exam } = authorization;

    if (exam.isArchived) {
      return res.status(400).json({
        message: "Archived exams cannot be published",
      });
    }

    exam.isPublished = true;
    await exam.save();

    res.status(200).json({
      message: "Exam published successfully",
      exam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateExamRetakeSettings = async (req, res) => {
  try {
    const { examId } = req.params;
    const { allowRetakes, maxAttempts } = req.body;

    if (!examId || typeof allowRetakes !== "boolean") {
      return res.status(400).json({
        message: "Exam ID and allowRetakes flag are required",
      });
    }

    const authorization = await getAuthorizedExam(examId, req.user);

    if (authorization.status) {
      return res.status(authorization.status).json(authorization.body);
    }

    const nextMaxAttempts = allowRetakes ? Number(maxAttempts) : 1;

    if (
      Number.isNaN(nextMaxAttempts) ||
      !Number.isInteger(nextMaxAttempts) ||
      nextMaxAttempts <= 0
    ) {
      return res.status(400).json({
        message: "Maximum attempts must be a positive whole number",
      });
    }

    const { exam } = authorization;

    if (exam.isArchived) {
      return res.status(400).json({
        message: "Archived exams cannot update retake settings",
      });
    }

    exam.allowRetakes = allowRetakes;
    exam.maxAttempts = allowRetakes ? nextMaxAttempts : 1;
    await exam.save();

    res.status(200).json({
      message: "Retake settings updated successfully",
      exam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers } = req.body;
    const studentId = req.user._id;

    if (!examId || !answers) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.isArchived) {
      return res.status(403).json({ message: "Exam not available" });
    }

    if (!exam.isPublished) {
      return res.status(403).json({ message: "Exam not available" });
    }

    const attempt = await Attempt.findOne({
      examId,
      studentId,
      submittedAt: null,
    }).sort({ attemptNumber: -1, createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({ message: "Exam not started" });
    }

    const startTime = new Date(attempt.startedAt);
    const now = new Date();

    const elapsedMinutes = (now - startTime) / 60000;

    if (elapsedMinutes > exam.duration) {
      return res.status(403).json({
        message: "Exam time exceeded",
      });
    }

    const questions = await Question.find({ examId });

    let score = 0;

    answers.forEach((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId,
      );

      if (question && question.correctAnswer === answer.selectedOption) {
        score += question.marks;
      }
    });

    attempt.answers = answers;
    attempt.score = score;
    attempt.submittedAt = new Date();

    await attempt.save();

    res.status(200).json({
      message: "Exam submitted successfully",
      score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAvailableExams = async (req, res) => {
  try {
    const exams = await Exam.find({
      isPublished: true,
      isArchived: { $ne: true },
    }).select(
      "title description duration totalMarks examCode allowRetakes maxAttempts",
    );

    if (req.user?.role !== "student") {
      return res.status(200).json(exams);
    }

    const studentAttempts = await Attempt.find({
      studentId: req.user._id,
      examId: { $in: exams.map((exam) => exam._id) },
    }).select("examId startedAt submittedAt attemptNumber");

    const examsWithAttemptInfo = exams.map((exam) => {
      const attemptsForExam = studentAttempts.filter(
        (attempt) => attempt.examId.toString() === exam._id.toString(),
      );
      const activeAttempt = attemptsForExam.find((attempt) => {
        if (attempt.submittedAt) {
          return false;
        }

        const endTime =
          new Date(attempt.startedAt).getTime() + exam.duration * 60 * 1000;

        return endTime > Date.now();
      });
      const usedAttempts = attemptsForExam.length;
      const maxAttempts = exam.allowRetakes ? exam.maxAttempts : 1;
      const attemptsRemaining = Math.max(0, maxAttempts - usedAttempts);

      return {
        ...exam.toObject(),
        usedAttempts,
        maxAttempts,
        attemptsRemaining,
        hasActiveAttempt: Boolean(activeAttempt),
        activeAttemptId: activeAttempt?._id || null,
      };
    });

    res.status(200).json(examsWithAttemptInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getCreatedExam = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher Id Required" });
    }

    const exams = await Exam.find({
      createdBy: teacherId,
      isArchived: { $ne: true },
    }).lean();

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: "Exams Not Found" });
    }

    const attempts = await Attempt.find({
      examId: { $in: exams.map((exam) => exam._id) },
    }).select("examId");

    const attemptsByExam = attempts.reduce((counts, attempt) => {
      const key = attempt.examId.toString();
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});

    const examsWithAttemptCounts = exams.map((exam) => ({
      ...exam,
      attemptsCount: attemptsByExam[exam._id.toString()] || 0,
    }));

    res.status(200).json(examsWithAttemptCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const archiveExam = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam ID is required" });
    }

    const authorization = await getAuthorizedExam(examId, req.user);

    if (authorization.status) {
      return res.status(authorization.status).json(authorization.body);
    }

    const { exam } = authorization;
    exam.isArchived = true;
    exam.isPublished = false;
    await exam.save();

    return res.status(200).json({
      message: "Exam archived successfully",
      exam,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Exam ID is required" });
    }

    const authorization = await getAuthorizedExam(examId, req.user);

    if (authorization.status) {
      return res.status(authorization.status).json(authorization.body);
    }

    const recordedAttempts = await Attempt.countDocuments({ examId });

    if (recordedAttempts > 0) {
      return res.status(400).json({
        message:
          "This exam already has recorded attempts. Archive it instead of deleting it.",
      });
    }

    await Question.deleteMany({ examId });
    await Exam.findByIdAndDelete(examId);

    return res.status(200).json({
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createExam,
  getExamById,
  updateExam,
  archiveExam,
  deleteExam,
  publishExam,
  updateExamRetakeSettings,
  submitExam,
  getAvailableExams,
  getCreatedExam,
};
