import { Hono } from "hono";
import ogImage from "../../../packages/road-to-elite/og.png";
import roadToElite from "../../../packages/road-to-elite/template.html";
import { liveData } from "./data";

const app = new Hono();

app.get("/", (c) => c.redirect("/road-to-elite"));

// Request-time render: template + fresh data (upstreams edge-cached ~5 min).
app.get("/road-to-elite", async (c) => {
  const data = await liveData(new Date());
  const html = roadToElite.replace("__DATA__", JSON.stringify(data));
  return c.html(html, 200, { "cache-control": "public, max-age=60" });
});

app.get("/road-to-elite/og.png", (c) =>
  c.body(ogImage, 200, {
    "content-type": "image/png",
    "cache-control": "public, max-age=86400",
  }),
);

// Server-side WikiSync proxy for future pages / client-side refresh —
// browsers can't reach sync.runescape.wiki themselves (Origin allowlist).
app.get("/api/wikisync/:name", async (c) => {
  const { fetchWikiSync } = await import("./data");
  try {
    const data = await fetchWikiSync(c.req.param("name"));
    return c.json(data, 200, {
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300",
    });
  } catch (err) {
    return c.json({ error: String(err) }, 502);
  }
});

app.notFound((c) => c.text("not found", 404));

export default app;
