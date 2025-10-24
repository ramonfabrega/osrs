import { fetchStars } from "../../stars";

// Fetch stars and save to JSON for testing
const { stars, meta } = await fetchStars({ limit: 15, minTier: 1 });

console.log(`📊 Fetched ${meta.filtered} stars (${meta.total} total)`);

const path = "src/stream/render/samples/stars.json";

await Bun.write(path, JSON.stringify(stars, null, 2));

console.log(`✅ Saved to ${path}`);
