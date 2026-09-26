const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the website files
app.use(express.static(path.join(__dirname)));

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "online" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Neon Relay running on port ${PORT}`);
});
