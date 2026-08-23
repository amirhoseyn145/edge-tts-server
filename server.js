const express = require("express");

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Edge TTS Server",
    message: "Server is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Edge TTS Server running on port ${PORT}`);
});
