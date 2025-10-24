import satori from "satori";
import type { ParsedStar } from "../../stars";

// Load font at module level (cached)
const fontData = await Bun.file("src/stream/fonts/Regular.ttf").arrayBuffer();

/**
 * Renders star data to SVG
 * @param stars Array of parsed star data
 * @returns SVG string
 */
export async function renderStarsSVG(stars: ParsedStar[]): Promise<string> {
  return await satori(<StarTable stars={stars} />, {
    width: 1280,
    height: 720,
    fonts: [
      {
        name: "Geist Mono",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  });
}

function StarTable({ stars }: { stars: ParsedStar[] }) {
  // Random bg color for dev (to see updates)
  const bgColors = [
    "#0a0a0a", // black
    "#1a0505", // dark red
    "#051a05", // dark green
    "#05051a", // dark blue
    "#1a1a05", // dark yellow
    "#1a051a", // dark magenta
    "#051a1a", // dark cyan
    "#1a0a05", // dark orange
    "#0a051a", // dark purple
    "#1a0a0a", // darker red
  ];
  const bgColor = bgColors[Math.floor(Math.random() * bgColors.length)];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 1280,
        height: 720,
        backgroundColor: bgColor,
        color: "#ffffff",
        fontFamily: "Geist Mono",
        padding: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          fontSize: 36,
          marginBottom: 40,
          fontWeight: 700,
        }}
      >
        OSRS Shooting Stars
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: "flex",
          fontSize: 18,
          marginBottom: 20,
          opacity: 0.6,
        }}
      >
        <div style={{ display: "flex", width: 120 }}>World</div>
        <div style={{ display: "flex", width: 100 }}>Tier</div>
        <div style={{ display: "flex", width: 600 }}>Location</div>
        <div style={{ display: "flex", width: 200 }}>Called</div>
      </div>

      {/* Data rows */}
      {stars.slice(0, 12).map((star, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            fontSize: 22,
            marginBottom: 10,
            opacity: 1 - (i / 15) * 0.4,
          }}
        >
          <div style={{ display: "flex", width: 120 }}>W{star.world}</div>
          <div style={{ display: "flex", width: 100 }}>T{star.tier}</div>
          <div style={{ display: "flex", width: 600 }}>{star.location}</div>
          <div style={{ display: "flex", width: 200, opacity: 0.7 }}>
            {star.called}
          </div>
        </div>
      ))}
    </div>
  );
}

// Test/CLI code
if (import.meta.main) {
  const starsSample = (await import("./samples/stars.json"))
    .default as ParsedStar[];

  console.log(`📊 Rendering ${starsSample.length} stars...`);
  const svg = await renderStarsSVG(starsSample);

  const path = "src/stream/render/samples/stars.svg";
  await Bun.write(path, svg);
  console.log(`✅ Saved to ${path}`);
}
