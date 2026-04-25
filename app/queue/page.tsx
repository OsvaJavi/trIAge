"use client";

import { useState } from "react";
import QueueBoard from "@/components/QueueBoard";
import TriageResult from "@/components/TriageResult";
import type { Patient } from "@/app/page";

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

export default function QueuePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MOCK_PATIENTS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark">Rx</div>
          <div>
            <p className="logo-name">TRIAJE</p>
            <p className="logo-sub">cola de espera</p>
          </div>
        </div>
        <a href="/" style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "12px",
          color: "#888780",
          textDecoration: "none",
        }}>← Volver al dashboard</a>
      </header>

      <div className="body-grid">
        <aside className="col-queue">
          <QueueBoard
            patients={MOCK_PATIENTS}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <main style={{ background: "#fff", overflowY: "auto" }}>
          {selected ? (
            <TriageResult patient={selected} />
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🏥</span>
              <p>Selecciona un paciente de la cola</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
