import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Only these domains can be checked.
// Add your own domains here if you own/authorize them.
const ALLOWED_HOSTS = new Set([
  "example.com",
  "www.example.com"
]);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ status: "online" });
});

app.post("/api/fetch", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "Please enter a URL."
      });
    }

    let target;

    try {
      target = new URL(url);
    } catch {
      return res.status(400).json({
        error: "Invalid URL."
      });
    }

    if (!["http:", "https:"].includes(target.protocol)) {
      return res.status(400).json({
        error: "Only HTTP and HTTPS URLs are allowed."
      });
    }

    if (!ALLOWED_HOSTS.has(target.hostname)) {
      return res.status(403).json({
        error: `This destination is not authorized. Allowed host: ${[...ALLOWED_HOSTS].join(", ")}`
      });
    }

    const start = Date.now();

    const response = await fetch(target, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000)
    });

    const body = await response.text();
    const elapsed = Date.now() - start;

    // Keep the response reasonably small.
    const preview = body.slice(0, 10000);

    res.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      size: body.length,
      responseTime: `${elapsed} ms`,
      preview
    });

  } catch (error) {
    res.status(502).json({
      error: "The authorized destination could not be reached."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Neon Relay running on port ${PORT}`);
});
