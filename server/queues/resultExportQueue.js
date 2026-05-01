const { Queue } = require("bullmq");
const { createRedisConnection } = require("../config/redis");

const RESULT_EXPORT_QUEUE_NAME = "result-export";
let resultExportQueue = null;

const getResultExportQueue = () => {
  if (!resultExportQueue) {
    resultExportQueue = new Queue(RESULT_EXPORT_QUEUE_NAME, {
      connection: createRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 50,
      },
    });
  }

  return resultExportQueue;
};

module.exports = {
  RESULT_EXPORT_QUEUE_NAME,
  getResultExportQueue,
};
