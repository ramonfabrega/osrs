import { Resvg } from "@resvg/resvg-js";
import { renderStarsSVG } from "./svg.tsx";
import type { ParsedStar } from "../../stars";

/**
 * Renders star data to PNG
 * @param stars Array of parsed star data
 * @returns PNG as Uint8Array
 */
export async function renderStarsPNG(stars: ParsedStar[]): Promise<Uint8Array> {
  // First, render to SVG
  const svg = await renderStarsSVG(stars);

  // Convert SVG to PNG using Resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1280,
    },
  });

  const pngData = resvg.render();
  const png = pngData.asPng();
  return new Uint8Array(png);
}

// Test/CLI code
if (import.meta.main) {
  const starsSample = (await import("./samples/stars.json"))
    .default as ParsedStar[];

  console.log(`📊 Rendering ${starsSample.length} stars to PNG...`);
  const png = await renderStarsPNG(starsSample);

  const path = "src/stream/render/samples/stars.png";
  await Bun.write(path, png);
  console.log(`✅ Saved to ${path}`);
  console.log(`   Size: ${(png.length / 1024).toFixed(1)} KB`);
}
