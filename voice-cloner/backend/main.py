from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import FileResponse, JSONResponse
import tempfile
import os
from TTS.api import TTS
import uvicorn

app = FastAPI()

# Charger le modèle XTTS (zero-shot, multilingue)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

@app.post("/api/clone")
async def clone_voice(
    ref: UploadFile = File(...),
    text: str = Form(...),
    language: str = Form("fr"),
    options: str = Form("{}")
):
    try:
        tmp_ref = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        tmp_ref.write(await ref.read())
        tmp_ref.close()

        out_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name

        tts.tts_to_file(
            text=text,
            speaker_wav=tmp_ref.name,
            language=language,
            file_path=out_path
        )

        return FileResponse(out_path, media_type="audio/wav", filename="voice_clone.wav")

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
async def root():
    return {"message": "API de clonage vocal 🚀 en ligne avec FastAPI"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
