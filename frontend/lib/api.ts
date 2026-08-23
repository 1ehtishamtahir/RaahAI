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

export async function feeApi(service: string, urgency: string = "normal") {
  const res = await fetch(`${API}/fees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, urgency }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function eligibilityApi(data: { age: number; is_pakistani?: boolean; has_cnic?: boolean }) {
  const res = await fetch(`${API}/eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function feedbackApi(message_id: string, rating: string, comment?: string) {
  const res = await fetch(`${API}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message_id, rating, comment }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function officesApi(city?: string, type?: string) {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  if (type) params.append("type", type);
  const res = await fetch(`${API}/offices?${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function officesCitiesApi() {
  const res = await fetch(`${API}/offices/cities`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function alertsApi() {
  const res = await fetch(`${API}/alerts`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addAlertApi(data: { document_type: string; holder_name: string; cnic: string; issue_date: string; expiry_date: string }) {
  const res = await fetch(`${API}/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAlertApi(alertId: string) {
  const res = await fetch(`${API}/alerts/${alertId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Citizen Command Center ---
export async function citizenDashboardApi() {
  const res = await fetch(`${API}/api/citizen/dashboard`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function citizenProfileApi() {
  const res = await fetch(`${API}/api/citizen/profile`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function identityListApi() {
  const res = await fetch(`${API}/api/identity`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function identityFlowApi(service: string) {
  const res = await fetch(`${API}/api/identity/${service}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function identityStatusApi(service: string) {
  const res = await fetch(`${API}/api/identity/${service}/status`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function vehiclesApi() {
  const res = await fetch(`${API}/api/vehicle`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function challansApi(status?: string) {
  const q = status ? `?status=${status}` : "";
  const res = await fetch(`${API}/api/challans${q}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function paymentsTimelineApi() {
  const res = await fetch(`${API}/api/payments/timeline`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function opportunitiesApi() {
  const res = await fetch(`${API}/api/opportunities`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function opportunitiesRecommendedApi() {
  const res = await fetch(`${API}/api/opportunities/recommended`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function familyProfileApi() {
  const res = await fetch(`${API}/api/family/profile`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function familyProgramsApi() {
  const res = await fetch(`${API}/api/family/programs`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function updatesLatestApi() {
  const res = await fetch(`${API}/api/updates/latest`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function updatesRecommendedApi() {
  const res = await fetch(`${API}/api/updates/recommended`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function orchestratorApi(query: string, lang: string = "en") {
  const res = await fetch(`${API}/api/orchestrator/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, lang }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
