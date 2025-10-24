import { Hono } from "hono";

const app = new Hono();

// Serve inline HTML player at /
app.get("/", (c) => {
  return c.html(
    `<!doctype html><video autoplay muted playsinline controls loop src="playlist.m3u8" style="max-width:100%;background:#000"></video>`
  );
});

// Serve static files with proper MIME types
app.get("*", async (c) => {
  const path = c.req.path;
  const file = Bun.file(`src/stream/encode/samples${path}`);

  if (!(await file.exists())) return c.notFound();

  const headers: Record<string, string> = {};

  if (path.endsWith(".m3u8")) {
    headers["Content-Type"] = "application/vnd.apple.mpegurl";
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate"; // Never cache playlist
  } else if (path.endsWith(".ts")) {
    headers["Content-Type"] = "video/mp2t";
    headers["Cache-Control"] = "public, max-age=31536000, immutable"; // Cache segments
  }

  return c.body(file.stream(), { headers });
});

export default app;
