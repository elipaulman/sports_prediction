import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  // Default to local Redis instance
  return 'redis://localhost:6379';
};

const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 3,
});

redis.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

export default redis; 