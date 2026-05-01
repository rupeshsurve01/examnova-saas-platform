const dotenv = require("dotenv");
const { Worker } = require("bullmq");
const connectDB = require("../config/db");
const { createRedisConnection } = require("../config/redis");
const { RESULT_EXPORT_QUEUE_NAME } = require("../queues/resultExportQueue");
const {
  buildExamExportPayload,
  writeExamExportFile,
} = require("../services/resultExportService");

dotenv.config();
connectDB();

const worker = new Worker(
  RESULT_EXPORT_QUEUE_NAME,
  async (job) => {
    const payload = await buildExamExportPayload(job.data.examId);
    const filePath = await writeExamExportFile({
      examId: job.data.examId,
      payload,
      jobId: job.id,
    });

    return {
      filePath,
      totalAttempts: payload.summary.totalAttempts,
      exportedAt: payload.exportedAt,
    };
  },
  {
    connection: createRedisConnection(),
  },
);

worker.on("completed", (job, result) => {
  console.log(
    `Export job ${job.id} completed for exam ${job.data.examId}: ${result.filePath}`,
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `Export job ${job?.id || "unknown"} failed for exam ${job?.data?.examId || "unknown"}:`,
    error.message,
  );
});

console.log("Result export worker is running...");
