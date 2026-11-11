import { Queue } from 'bullmq';
import redisConnection from '../config/redis.js';

const videoQueue = new Queue('video-transcoding',{
    connection:redisConnection
});

export default videoQueue;
