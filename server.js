const express = require("express");
const { spawn } = require("child_process");

const app = express();

app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Edge TTS Server",
    message: "Server is running"
  });
});

app.post("/tts", (req, res) => {
  const { text, voice } = req.body;

  if (!text) {
    return res.status(400).json({
      status: "error",
      message: "text is required"
    });
  }

  const selectedVoice = voice || "fa-IR-FaridNeural";

  console.log("TTS request received");
  console.log("Voice:", selectedVoice);
  console.log("Text:", text);

  const python = spawn("python", [
    "-m",
    "edge_tts",
    "--voice",
    selectedVoice,
    "--text",
    text,
    "--write-media",
    "/tmp/output.mp3"
  ]);

  let errorOutput = "";

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      console.error("Edge TTS error:", errorOutput);

      return res.status(500).json({
        status: "error",
        message: "Edge TTS failed",
        details: errorOutput
      });
    }

    res.sendFile("/tmp/output.mp3", {
      headers: {
        "Content-Type": "audio/mpeg"
      }
    });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Edge TTS Server running on port ${PORT}`);
});
