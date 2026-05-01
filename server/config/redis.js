const IORedis = require("ioredis");

const redisUrl = process.env.REDIS_URL;

const createRedisConnection = (overrides = {}) => {
  if (redisUrl) {
    return new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      ...overrides,
    });
  }

  return new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    ...overrides,
  });
};

module.exports = {
  createRedisConnection,
};
