import express from "express";
import dns from "node:dns/promises";
import net from "node:net";

const app = express();
const PORT = process.env.PORT || 3000;

// Only permit domains you control or explicitly authorize.
// Example:
// ALLOWED_HOSTS=example.com,docs.example.com
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || "")
  .split(",")
  .map(x => x.trim().toLowerCase())
  .filter(Boolean);

app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

function hostAllowed(hostname) {
  const h = hostname.toLowerCase();
  return ALLOWED_HOSTS.some(
    allowed => h === allowed || h.endsWith("." + allowed)
  );
}

function privateIPv4(ip) {
  const [a,b] = ip.split(".").map(Number);
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 0
  );
}

function privateIPv6(ip) {
  const h = ip.toLowerCase();
  return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80:");
}

async function resolvesPublic(hostname) {
  const addresses = await dns.lookup(hostname, { all: true });
  if (!addresses.length) return false;

  return addresses.every(({ address, family }) =>
    family === 4 ? !privateIPv4(address) : !privateIPv6(address)
  );
}

app.post("/api/fetch", async (req, res) => {
  try {
    const raw = String(req.body?.url || "").trim();
    if (!raw) return res.status(400).json({ error: "Enter a URL." });

    const url = new URL(raw);

    if (!["http:", "https:"].includes(url.protocol)) {
      return res.status(400).json({ error: "Only HTTP and HTTPS URLs are supported." });
    }

    if (url.username || url.password) {
      return res.status(400).json({ error: "Credentials in URLs are not allowed." });
    }

    if (!hostAllowed(url.hostname)) {
      return res.status(403).json({
        error: "That host is not on the server's allowlist."
      });
    }

    if (!(await resolvesPublic(url.hostname))) {
      return res.status(403).json({ error: "Private/internal destinations are blocked." });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "NeonRelay/1.0"
      }
    });

    clearTimeout(timeout);

    const contentType = upstream.headers.get("content-type") || "text/plain";
    const body = await upstream.text();

    // Return text/HTML only in this demo. Do not blindly relay arbitrary binary data.
    if (!contentType.includes("text/") && !contentType.includes("json") && !contentType.includes("xml")) {
      return res.status(415).json({ error: "This demo only relays text-based responses." });
    }

    res.status(upstream.status);
    res.set("Content-Type", contentType);
    res.set("X-Relay-Status", String(upstream.status));
    res.send(body);
  } catch (err) {
    const message = err?.name === "AbortError"
      ? "The upstream request timed out."
      : "The server could not fetch that URL.";
    res.status(502).json({ error: message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    allowedHostsConfigured: ALLOWED_HOSTS.length > 0
  });
});

app.listen(PORT, () => {
  console.log(`Neon Relay running on port ${PORT}`);
});
