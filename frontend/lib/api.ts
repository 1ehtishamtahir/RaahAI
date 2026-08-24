const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("raahai-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authLoginApi(email: string, password: string) {
  const res = await fetch(`${API}/api/citizen/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Login failed");
  return res.json();
}

export async function authRegisterApi(data: any) {
  const res = await fetch(`${API}/api/citizen/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Registration failed");
  return res.json();
}

export async function chatApi(query: string, lang: string, session_id?: string) {
  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ query, lang, session_id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function ocrApi(file: File, lang: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("lang", lang);
  const res = await fetch(`${API}/ocr`, { method: "POST", body: fd, headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function voiceApi(audio: Blob, lang: string) {
  const fd = new FormData();
  fd.append("audio", audio, "audio.webm");
  fd.append("lang", lang);
  const res = await fetch(`${API}/voice`, { method: "POST", body: fd, headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checklistApi(service: string, situation: string, completed: string[] = []) {
  const params = new URLSearchParams({ service, situation, completed: completed.join(",") });
  const res = await fetch(`${API}/checklist?${params}`, { headers: authHeaders() });
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
    headers: { "Content-Type": "application/json", ...authHeaders() },
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
  const res = await fetch(`${API}/alerts`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addAlertApi(data: { document_type: string; holder_name: string; cnic: string; issue_date: string; expiry_date: string; custom_type_name?: string }) {
  const res = await fetch(`${API}/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAlertApi(alertId: string) {
  const res = await fetch(`${API}/alerts/${alertId}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateAlertApi(alertId: string, data: { document_type?: string; holder_name?: string; cnic?: string; issue_date?: string; expiry_date?: string; custom_type_name?: string }) {
  const res = await fetch(`${API}/alerts/${alertId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Citizen Command Center ---
export async function citizenDashboardApi() {
  const res = await fetch(`${API}/api/citizen/dashboard`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function citizenProfileApi() {
  const res = await fetch(`${API}/api/citizen/profile`, { headers: authHeaders() });
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
  const res = await fetch(`${API}/api/vehicle`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function vehicleFlowApi(service: string) {
  const res = await fetch(`${API}/api/vehicle/flow/${service}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function challansApi(status?: string) {
  const q = status ? `?status=${status}` : "";
  const res = await fetch(`${API}/api/challans${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function paymentsTimelineApi(params?: { status?: string; category?: string; type?: string; q?: string; sort?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.append("status", params.status);
  if (params?.category) qs.append("category", params.category);
  if (params?.type) qs.append("type", params.type);
  if (params?.q) qs.append("q", params.q);
  if (params?.sort) qs.append("sort", params.sort);
  const url = `${API}/api/payments/timeline${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function paymentsAnalyticsApi() {
  const res = await fetch(`${API}/api/payments/analytics`, { headers: authHeaders() });
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
  const res = await fetch(`${API}/api/family/profile`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function familyProgramsApi() {
  const res = await fetch(`${API}/api/family/programs`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function familyAddMemberApi(data: any) {
  const res = await fetch(`${API}/api/family/member`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
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

export async function chatSessionsApi() {
  const res = await fetch(`${API}/chat/sessions`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function chatSessionMessagesApi(sessionId: string) {
  const res = await fetch(`${API}/chat/sessions/${sessionId}/messages`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function chatSessionDeleteApi(sessionId: string) {
  const res = await fetch(`${API}/chat/sessions/${sessionId}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function notificationsApi() {
  const res = await fetch(`${API}/api/notifications`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function notificationsCountApi() {
  const res = await fetch(`${API}/api/notifications/count`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function aiDashboardSuggestions() {
  const res = await fetch(`${API}/api/ai/dashboard-suggestions`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function aiDeadlines() {
  const res = await fetch(`${API}/api/ai/deadlines`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function aiDocumentAdvisor(fields: any[], serviceType: string, lang: string) {
  const res = await fetch(`${API}/api/ai/document-advisor`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ fields, service_type: serviceType, lang }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function aiChallanExplain(challanId: string, lang: string) {
  const res = await fetch(`${API}/api/ai/challan-explain/${challanId}?lang=${lang}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function aiEligibilityMatch(data: { age: number; education: string; province: string; gender: string }) {
  const res = await fetch(`${API}/api/ai/eligibility-match`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
