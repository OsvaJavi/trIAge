// services/api.ts
// Capa de acceso al backend FastAPI.
// Cambia BASE_URL a tu URL de Railway/localhost cuando el backend esté listo.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types (espejo de backend/app/core/schemas.py) ────────────────────────────

export interface TriagePayload {
  name: string;
  age: number;
  sex: "M" | "F";
  hr: number;
  spo2: number;
  bp: string;
  complaint: string;
  symptoms: string[];
}

export interface TriageResponse {
  patient_id: string;
  priority: 1 | 2 | 3;
  ai_label: string;
  confidence: number;
  tx_hash: string;
}

export interface QueuePatient {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  complaint: string;
  symptoms: string[];
  hr: number;
  spo2: number;
  bp: string;
  priority: 1 | 2 | 3;
  ai_label: string;
  confidence: number;
  created_at: string; // ISO date
}

export interface QueueStatusPatch {
  status: "waiting" | "in_progress" | "discharged";
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API ${res.status}: ${error}`);
  }

  return res.json() as Promise<T>;
}

// POST /triage
// Llama al clasificador IA y registra el hash en Monad.
export async function submitTriage(payload: TriagePayload): Promise<TriageResponse> {
  return request<TriageResponse>("/triage", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// GET /queue
// Devuelve la cola activa ordenada por prioridad.
export async function fetchQueue(): Promise<QueuePatient[]> {
  return request<QueuePatient[]>("/queue");
}

// PATCH /queue/:id/status
// Actualiza el estado de un paciente en la cola.
export async function updatePatientStatus(
  id: string,
  status: QueueStatusPatch["status"]
): Promise<void> {
  await request<void>(`/queue/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// GET /patients/:id
// Historial completo de un paciente.
export async function fetchPatient(id: string): Promise<QueuePatient> {
  return request<QueuePatient>(`/patients/${id}`);
}
