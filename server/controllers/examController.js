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
    const exams = await Exam.find({ isPublished: true }).select(
      "title description duration totalMarks examCode allowRetakes maxAttempts",
    );

    res.status(200).json(exams);
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

    const exams = await Exam.find({ createdBy: teacherId });

    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: "Exams Not Found" });
    }

    res.status(200).json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createExam,
  publishExam,
  updateExamRetakeSettings,
  submitExam,
  getAvailableExams,
  getCreatedExam,
};
