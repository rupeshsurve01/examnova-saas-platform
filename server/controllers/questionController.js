const Question = require("../models/Question")

const addQuestions = async (req, res) => {
    try {
        const { examId } = req.params
        const { questionText, options, correctAnswer, marks } = req.body

        if (!examId || !questionText || !options || correctAnswer === undefined || !marks) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const question = await Question.create({
            examId,
            questionText,
            options,
            correctAnswer,
            marks
        })

        res.status(201).json({
            message: "Question added successfully",
            question
        })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: "Server Error" })
    }
}

module.exports = { addQuestions }