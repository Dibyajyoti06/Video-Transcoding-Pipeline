import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import fs from "fs";
import transcodeVideo from "../service/video.transcode.js";

const videoWorker = new Worker(
  "video-transcoding",
  async (job) => {
    const { videoId, inputPath, originalName } = job.data;
    console.log("job data: ", job.data);

    console.log(`Processing video: ${videoId}`);

    // Check whether the uploaded file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error("Uploaded video file not found");
    }

    console.log("Original video:", originalName);
    console.log("File path:", inputPath);

    // Next: FFprobe + FFmpeg transcoding
    const result = await transcodeVideo(inputPath, videoId);

    console.log(result);

    console.log(`Video ${videoId} processed successfully`);

    return {
      videoId,
      status: "COMPLETED",
    };
  },

  {
    connection: redisConnection,
  },
);

videoWorker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed`, result);
});

videoWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

videoWorker.on("error", (error) => {
  console.error("Worker error:", error);
});

console.log("Video worker started...");
