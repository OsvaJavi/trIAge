"use client";

import { useState } from "react";
import PatientForm from "@/components/PatientForm";
import TriageResult from "@/components/TriageResult";
import type { Patient, Priority } from "@/app/page";

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
    return { priority: 1, aiLabel: "P1 — Crítico", confidence: Math.round(88 + Math.random() * 10) };
  }
  if (symptoms.includes("disnea") || symptoms.includes("trauma") || hr > 100) {
    return { priority: 2, aiLabel: "P2 — Urgente", confidence: Math.round(80 + Math.random() * 10) };
  }
  return { priority: 3, aiLabel: "P3 — Estable", confidence: Math.round(82 + Math.random() * 12) };
}

export default function TriagePage() {
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<Patient | null>(null);

  async function handleSubmit(formData: {
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

    setResult({
      id: crypto.randomUUID(),
      ...formData,
      priority,
      aiLabel,
      confidence,
      waitSince: new Date(),
    });
    setClassifying(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark">Rx</div>
          <div>
            <p className="logo-name">TRIAJE</p>
            <p className="logo-sub">nuevo paciente</p>
          </div>
        </div>
        <a href="/" className="back-link">← Volver al dashboard</a>
      </header>

      <div className="triage-body">
        <section className="form-panel">
          <PatientForm onSubmit={handleSubmit} loading={classifying} />
        </section>

        {result && (
          <section className="detail-panel">
            <TriageResult patient={result} />
          </section>
        )}
      </div>

      <style jsx>{`
        .back-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: #888780;
          text-decoration: none;
        }
        .back-link:hover { color: #1A1917; }

        .triage-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
