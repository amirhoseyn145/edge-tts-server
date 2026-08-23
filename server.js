const express = require("express");
const { EdgeTTS } = require("edge-tts");

const app = express();

app.use(express.json({ limit: "1mb" }));

// صفحه اصلی برای تست اینکه سرور روشن است
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Edge TTS Server",
    message: "Server is running"
  });
});

// تست اولیه TTS
app.post("/tts", async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required"
      });
    }

    const selectedVoice = voice || "fa-IR-FaridNeural";

    console.log("TTS request received");
    console.log("Voice:", selectedVoice);
    console.log("Text:", text);

    const tts = new EdgeTTS();

    await tts.synthesize(text, selectedVoice);

    const audioBuffer = await tts.toBuffer();

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error("TTS ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
});

// Render پورت را از ENV می‌دهد
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Edge TTS Server running on port ${PORT}`);
});
