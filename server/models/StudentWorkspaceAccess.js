const mongoose = require("mongoose");

const StudentWorkspaceAccessSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

StudentWorkspaceAccessSchema.index(
  { studentId: 1, teacherId: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "StudentWorkspaceAccess",
  StudentWorkspaceAccessSchema,
);
