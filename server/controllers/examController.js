const Exam = require("../models/Exam");

const createExam = async (req, res) => {
  try {
    const { title, description, totalMarks, duration, examCode } = req.body;

    if (!title || !description || !totalMarks || !duration || !examCode) {
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
      createdBy: req.body.createdBy // temporary until JWT auth added
    });

    res.status(201).json({
      message: "Exam created successfully",
      exam
    });

  } catch (error) {
  console.error(error);
  res.status(500).json({ message: error.message });
}
};

module.exports = { createExam };