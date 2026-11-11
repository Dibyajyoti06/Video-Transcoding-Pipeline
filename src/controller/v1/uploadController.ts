import type { Request, Response } from "express";
import videoQueue from "../../queues/video.queue.js";

export interface VideoJobData {
  videoId: string;
  inputPath: string;
  originalName: string;
}

interface UploadResponse {
  message: string;
  videoId: string;
  jobId: string | undefined;
  status: "QUEUED";
}

interface ErrorResponse {
  error: string;
}

async function upload(
  req: Request,
  res: Response<UploadResponse | ErrorResponse>,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No video file provided" });
      return;
    }
    const videoId = crypto.randomUUID();
    const jobData: VideoJobData = {
      videoId,
      inputPath: req.file.path,
      originalName: req.file.originalname,
    };

    const job = await videoQueue.add("transcode-video", jobData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    res.status(202).json({
      message: "Video uploaded and queued for processing",
      videoId,
      jobId: job.id,
      status: "QUEUED",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

export default upload;
