"use client";

import { useState } from "react";
import QueueBoard from "@/components/QueueBoard";
import PatientForm from "@/components/PatientForm";
import TriageResult from "@/components/TriageResult";
import TxStatus from "@/components/TxStatus";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Priority = 1 | 2 | 3;

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F";
  complaint: string;
  symptoms: string[];
  hr: number;
  spo2: number;
  bp: string;
  priority: Priority;
  aiLabel: string;
  confidence: number;
  waitSince: Date;
}

export interface ChainTx {
  hash: string;
  patientName: string;
  priority: Priority;
  aiLabel: string;
  timestamp: Date;
  status: "confirmed" | "pending";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PATIENTS: Patient[] = [
  {
    id: "1",
    name: "Carlos Mendoza",
    age: 67,
    sex: "M",
    complaint: "Dolor torácico irradiado a brazo izquierdo",
    symptoms: ["dolor torácico", "disnea"],
    hr: 112,
    spo2: 91,
    bp: "160/95",
    priority: 1,
    aiLabel: "P1 — Crítico",
    confidence: 96,
    waitSince: new Date(Date.now() - 3 * 60000),
  },
  {
    id: "2",
    name: "Valentina Ruiz",
    age: 34,
    sex: "F",
    complaint: "Convulsiones tónico-clónicas repetidas",
    symptoms: ["convulsiones", "pérd. consciencia"],
    hr: 98,
    spo2: 94,
    bp: "135/80",
    priority: 1,
    aiLabel: "P1 — Crítico",
    confidence: 91,
    waitSince: new Date(Date.now() - 5 * 60000),
  },
  {
    id: "3",
    name: "Luis Torres",
    age: 52,
    sex: "M",
    complaint: "Trauma craneoencefálico por accidente",
    symptoms: ["trauma", "cefalea"],
    hr: 84,
    spo2: 97,
    bp: "145/88",
    priority: 2,
    aiLabel: "P2 — Urgente",
    confidence: 88,
    waitSince: new Date(Date.now() - 11 * 60000),
  },
  {
    id: "4",
    name: "Sofía Herrera",
    age: 28,
    sex: "F",
    complaint: "Fiebre alta 40°C con cefalea intensa",
    symptoms: ["fiebre", "cefalea", "náuseas"],
    hr: 102,
    spo2: 98,
    bp: "118/72",
    priority: 2,
    aiLabel: "P2 — Urgente",
    confidence: 83,
    waitSince: new Date(Date.now() - 18 * 60000),
  },
  {
    id: "5",
    name: "Marco Reyes",
    age: 45,
    sex: "M",
    complaint: "Náuseas y vómito sin sangre",
    symptoms: ["náuseas"],
    hr: 76,
    spo2: 99,
    bp: "122/78",
    priority: 3,
    aiLabel: "P3 — Estable",
    confidence: 90,
    waitSince: new Date(Date.now() - 25 * 60000),
  },
  {
    id: "6",
    name: "Elena Castro",
    age: 19,
    sex: "F",
    complaint: "Cefalea leve desde ayer",
    symptoms: ["cefalea"],
    hr: 72,
    spo2: 99,
    bp: "115/70",
    priority: 3,
    aiLabel: "P3 — Estable",
    confidence: 94,
    waitSince: new Date(Date.now() - 32 * 60000),
  },
];

const MOCK_TXS: ChainTx[] = [
  {
    hash: "0x4a3f91bc2e87d06c5f1a9b340ed72c891f4d3a67b2e50c81fd9e4b7263a1d8f9",
    patientName: "Roberto Paz",
    priority: 1,
    aiLabel: "P1 — Crítico",
    timestamp: new Date(Date.now() - 2 * 3600000),
    status: "confirmed",
  },
  {
    hash: "0x7c12e4a53b9f06d821c4e70b53a1d9f4c82b6e31a90d5c7f4b2e8130d6f9a452",
    patientName: "María López",
    priority: 2,
    aiLabel: "P2 — Urgente",
    timestamp: new Date(Date.now() - 4 * 3600000),
    status: "confirmed",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fakeHash(): string {
  const chars = "0123456789abcdef";
  return (
    "0x" +
    Array.from({ length: 64 }, () =>
      chars[Math.floor(Math.random() * 16)]
    ).join("")
  );
}

function classifyLocally(
  hr: number,
  spo2: number,
  symptoms: string[]
): { priority: Priority; aiLabel: string; confidence: number } {
  if (
    symptoms.includes("dolor torácico") ||
    symptoms.includes("convulsiones") ||
    symptoms.includes("pérd. consciencia") ||
    spo2 < 92
  ) {
    return {
      priority: 1,
      aiLabel: "P1 — Crítico",
      confidence: Math.round(88 + Math.random() * 10),
    };
  }
  if (
    symptoms.includes("disnea") ||
    symptoms.includes("trauma") ||
    hr > 100
  ) {
    return {
      priority: 2,
      aiLabel: "P2 — Urgente",
      confidence: Math.round(80 + Math.random() * 10),
    };
  }
  return {
    priority: 3,
    aiLabel: "P3 — Estable",
    confidence: Math.round(82 + Math.random() * 12),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [txLog, setTxLog] = useState<ChainTx[]>(MOCK_TXS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);

  const selected = patients.find((p) => p.id === selectedId) ?? null;

  async function handleTriageSubmit(formData: {
    name: string;
    age: number;
    sex: "M" | "F";
    hr: number;
    spo2: number;
    bp: string;
    complaint: string;
    symptoms: string[];
  }) {
    setClassifying(true);

    await new Promise((r) => setTimeout(r, 900));
    const { priority, aiLabel, confidence } = classifyLocally(
      formData.hr,
      formData.spo2,
      formData.symptoms
    );

    await new Promise((r) => setTimeout(r, 800));
    const hash = fakeHash();

    const newPatient: Patient = {
      id: crypto.randomUUID(),
      ...formData,
      priority,
      aiLabel,
      confidence,
      waitSince: new Date(),
    };

    const newTx: ChainTx = {
      hash,
      patientName: formData.name,
      priority,
      aiLabel,
      timestamp: new Date(),
      status: "confirmed",
    };

    setPatients((prev) =>
      [...prev, newPatient].sort((a, b) => a.priority - b.priority)
    );
    setTxLog((prev) => [newTx, ...prev]);
    setSelectedId(newPatient.id);
    setClassifying(false);
  }

  return (
    <div className="app-shell">
      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark">Rx</div>
          <div>
            <p className="logo-name">TRIAJE</p>
            <p className="logo-sub">emergency triage system</p>
          </div>
        </div>
        <div className="topbar-right">
          <span className="live-dot" />
          <span className="live-label">sistema activo</span>
          <span className="monad-pill">MONAD TESTNET</span>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="body-grid">

        {/* LEFT — Queue */}
        <aside className="col-queue">
          <QueueBoard
            patients={patients}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        {/* RIGHT */}
        <main className="col-main">

          {/* TOP ROW — Patient detail + Form */}
          <div className="top-row">

            {/* Patient detail */}
            <section className="detail-panel">
              {selected ? (
                <TriageResult patient={selected} />
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🏥</span>
                  <p>Selecciona un paciente de la cola</p>
                </div>
              )}
            </section>

            {/* Triage form */}
            <section className="form-panel">
              <PatientForm onSubmit={handleTriageSubmit} loading={classifying} />
            </section>
          </div>

          {/* BOTTOM ROW — Blockchain log */}
          <div className="bottom-row">
            <TxStatus txLog={txLog} />
          </div>
        </main>
      </div>
    </div>
  );
}
