const mongoose = require("mongoose")

const QuestionSchema = new mongoose.Schema(
{
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },

    questionText: {
        type: String,
        required: true,
        trim: true
    },

    options: {
        type: [String],
        required: true
    },

    correctAnswer: {
        type: Number,
        required: true
    },

    marks: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model("Question", QuestionSchema)