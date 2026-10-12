import asyncio

import edge_tts
from flask import Flask, Response, jsonify, request

app = Flask(__name__)

DEFAULT_VOICE = "fa-IR-FaridNeural"


async def synthesize(text: str, voice: str) -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    chunks = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    if not chunks:
        raise RuntimeError("No audio received from Edge TTS")
    return b"".join(chunks)


@app.get("/")
def health():
    return "OK"


@app.post("/tts")
def tts():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text") or "").strip()
    voice = str(data.get("voice") or DEFAULT_VOICE).strip()

    if not text:
        return jsonify(status="error", message="text is empty"), 400

    last_error = ""
    for _ in range(2):  # دو بار تلاش
        try:
            audio = asyncio.run(synthesize(text, voice))
            return Response(audio, mimetype="audio/mpeg")
        except Exception as e:  # noqa: BLE001
            last_error = str(e)

    return jsonify(status="error", message="Edge TTS failed", details=last_error[:1500]), 500
