"use client";

import { useState } from "react";
import { useQueue } from "@/hooks/useQueue";
import QueueBoard from "@/components/QueueBoard";
import TriageForm from "@/components/TriageForm";
import PatientCard from "@/components/PatientCard";
import BlockchainLog from "@/components/BlackchainLog";
import { submitTriage } from "@/api/client";

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

// ─── Mock TXs iniciales ───────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { queue, loading } = useQueue({ interval: 4000, enabled: true });
  const [txLog, setTxLog] = useState<ChainTx[]>(MOCK_TXS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);

  const selected = queue.find((p) => p.id === selectedId) ?? null;

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
    try {
      const response = await submitTriage(formData);

      const newTx: ChainTx = {
        hash: response.tx_hash,
        patientName: formData.name,
        priority: response.priority,
        aiLabel: response.ai_label,
        timestamp: new Date(),
        status: "confirmed",
      };

      setTxLog((prev) => [newTx, ...prev]);
      setSelectedId(response.patient_id);
    } catch (err) {
      console.error("Error al clasificar paciente:", err);
    } finally {
      setClassifying(false);
    }
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
          <span className="live-label">
            {loading ? "sincronizando…" : "sistema activo"}
          </span>
          <span className="monad-pill">MONAD TESTNET</span>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="body-grid">

        {/* LEFT — Queue */}
        <aside className="col-queue">
          <QueueBoard
            patients={queue}
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
                <PatientCard patient={selected} />
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">🏥</span>
                  <p>Selecciona un paciente de la cola</p>
                </div>
              )}
            </section>

            {/* Triage form */}
            <section className="form-panel">
              <TriageForm onSubmit={handleTriageSubmit} loading={classifying} />
            </section>
          </div>

          {/* BOTTOM ROW — Blockchain log */}
          <div className="bottom-row">
            <BlockchainLog txLog={txLog} />
          </div>
        </main>
      </div>
    </div>
  );
}