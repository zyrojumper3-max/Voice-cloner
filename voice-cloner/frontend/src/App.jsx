import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function App() {
  const [refFile, setRefFile] = useState(null);
  const [text, setText] = useState("Bonjour, ceci est un test de clonage.");
  const [language, setLanguage] = useState("fr");
  const [status, setStatus] = useState("idle");
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);

  async function handleClone(e) {
    e.preventDefault();
    setError(null);
    if (!refFile) return setError("Ajoute un échantillon de référence.");
    if (!text) return setError("Écris du texte à synthétiser.");

    setStatus("uploading");
    setAudioURL(null);

    try {
      const form = new FormData();
      form.append("ref", refFile);
      form.append("text", text);
      form.append("language", language);

      const resp = await fetch("https://voice-cloner-backend.onrender.com/api/clone", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) throw new Error("Erreur serveur");

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setStatus("done");
    } catch (err) {
      setError(String(err));
      setStatus("error");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Voice Cloner</h1>
      <input type="file" accept="audio/*" onChange={(e) => setRefFile(e.target.files[0])} />
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full border mt-2" />
      <button onClick={handleClone} className="px-4 py-2 bg-indigo-600 text-white rounded mt-2">
        Générer
      </button>
      {status}
      {error && <div className="text-red-500">{error}</div>}
      {audioURL && <audio controls src={audioURL} className="mt-2" />}
    </div>
  );
}
