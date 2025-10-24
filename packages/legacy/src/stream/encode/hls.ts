import type { ParsedStar } from "../../stars.ts";
import { loop } from "../../utils/index.ts";
import { renderStarsPNG } from "../render/png.tsx";

/**
 * Renders stars to HLS stream (convenience function)
 * @param stars Star data
 * @param outputDir Directory to write HLS files
 */
export async function renderStarsToHLS(
  stars: ParsedStar[],
  outputDir: string
): Promise<void> {
  const png = await renderStarsPNG(stars);

  const tempPNG = `${outputDir}/frame.png`;
  await Bun.write(tempPNG, png);
  console.log(`📝 Wrote temp PNG: ${tempPNG}`);

  await encodePNGtoHLS(tempPNG, outputDir);
}

/**
 * Encodes a PNG to HLS stream
 * @param pngPath Path to input PNG file
 * @param outputDir Directory to write HLS files (playlist.m3u8, segments)
 */
async function encodePNGtoHLS(
  pngPath: string,
  outputDir: string
): Promise<void> {
  // Clean up old segment files (but keep playlist for rolling updates)
  const glob = new Bun.Glob("seg-*.ts");
  for await (const file of glob.scan(outputDir)) {
    try {
      await Bun.$`rm ${outputDir}/${file}`;
    } catch (e) {}
  }

  const playlistPath = `${outputDir}/playlist.m3u8`;

  // ffmpeg command for still image → HLS with proper GOP and epoch-based segments
  const args = [
    "-y",
    "-loop",
    "1",
    "-i",
    pngPath,
    "-r",
    "1",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast",
    "-tune",
    "stillimage",
    "-crf",
    "28",
    // Force keyframes at 2s boundaries
    "-g",
    "2",
    "-keyint_min",
    "2",
    "-sc_threshold",
    "0",
    "-force_key_frames",
    "expr:gte(t,n_forced*2)",
    // Short job: 6s = 3 segments
    "-t",
    "6",
    "-f",
    "hls",
    "-hls_time",
    "2",
    "-hls_list_size",
    "3",
    "-hls_flags",
    "delete_segments+append_list+program_date_time+omit_endlist",
    "-hls_start_number_source",
    "epoch", // Bumps MEDIA-SEQUENCE each run
    "-hls_segment_filename",
    `${outputDir}/seg-%010d.ts`,
    playlistPath,
  ];

  console.log("🎬 Running ffmpeg...");
  const proc = Bun.spawn(["ffmpeg", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`ffmpeg failed with code ${exitCode}:\n${stderr}`);
  }

  console.log(`✅ HLS files written to ${outputDir}/`);
}

// Test/CLI code
if (import.meta.main) loop(runCLI, 10_000);

async function runCLI() {
  const { fetchStars } = await import("../../stars.ts");

  console.log("🌟 Fetching live star data...");
  const { stars, meta } = await fetchStars({ limit: 12, minTier: 1 });
  console.log(`📊 Found ${meta.filtered} stars (${meta.total} total)`);

  const outputDir = "src/stream/encode/samples";

  console.log(`🎬 Encoding ${stars.length} stars to HLS...`);
  await renderStarsToHLS(stars, outputDir);

  console.log("\n✅ Done! Files created:");
  console.log(`   ${outputDir}/playlist.m3u8`);
  console.log(`   ${outputDir}/*.ts (segments)`);
}
