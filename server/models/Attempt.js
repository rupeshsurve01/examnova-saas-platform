const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },

        selectedOption: {
          type: Number,
          required: true,
        },
      },
    ],

    score: {
      type: Number,
      default: 0,
    },

    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Attempt", AttemptSchema);
