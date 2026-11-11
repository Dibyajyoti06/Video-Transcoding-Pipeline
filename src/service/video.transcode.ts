import { execFile, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);

async function transcodeVideo(inputPath: string, videoId: string) {
  // STEP 1: Get original video information
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    inputPath,
  ]);

  const metadata = JSON.parse(stdout);

  if (!metadata.streams?.length) {
    throw new Error("No video stream found in input file");
  }

  const { width, height } = metadata.streams[0];

  console.log(`Original video: ${width}x${height}`);

  // STEP 2: Decide available qualities
  const qualities = [360, 480, 720, 1080];

  const availableQualities = qualities.filter((q) => q <= height);

  if (availableQualities.length === 0) {
    throw new Error("Video resolution is too low for transcoding");
  }

  // STEP 3: Create output directories
  const outputDir = path.resolve("processed-video-s3", videoId);

  await fs.mkdir(outputDir, { recursive: true });

  // STEP 4: Generate each quality
  for (const quality of availableQualities) {
    const qualityDir = path.join(outputDir, `${quality}p`);

    await fs.mkdir(qualityDir, { recursive: true });

    const outputPath = path.join(qualityDir, "index.m3u8");

    const segmentPath = path.join(qualityDir, "segment_%03d.ts");

    const args = [
      "-y",
      "-i",
      inputPath,

      "-vf",
      `scale=-2:${quality}`,

      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",

      "-force_key_frames",
      "expr:gte(t,n_forced*4)",

      "-c:a",
      "aac",
      "-b:a",
      "128k",

      "-f",
      "hls",
      "-hls_time",
      "4",
      "-hls_playlist_type",
      "vod",
      "-hls_segment_filename",
      segmentPath,

      outputPath,
    ];

    console.log(`Generating ${quality}p...`);
    console.log(`Output: ${outputPath}`);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", args);

      ffmpeg.stderr.on("data", (data) => {
        console.log(data.toString());
      });

      ffmpeg.on("error", reject);

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
    });

    console.log(`${quality}p completed!`);
  }

  console.log("All transcoding completed!");

  return {
    videoId,
    originalWidth: width,
    originalHeight: height,
    availableQualities,
  };
}

export default transcodeVideo;
