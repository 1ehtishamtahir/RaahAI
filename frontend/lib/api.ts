const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function chatApi(query: string, lang: string, session_id?: string) {
  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, lang, session_id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function ocrApi(file: File, lang: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("lang", lang);
  const res = await fetch(`${API}/ocr`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function voiceApi(audio: Blob, lang: string) {
  const fd = new FormData();
  fd.append("audio", audio, "audio.webm");
  fd.append("lang", lang);
  const res = await fetch(`${API}/voice`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checklistApi(service: string, situation: string, completed: string[] = []) {
  const params = new URLSearchParams({ service, situation, completed: completed.join(",") });
  const res = await fetch(`${API}/checklist?${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
