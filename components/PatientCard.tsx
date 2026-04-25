"use client";

import type { Patient, Priority } from "@/app/page";

interface Props {
  patient: Patient;
}

const COLORS: Record<Priority, { bg: string; txt: string }> = {
  1: { bg: "#FCEBEB", txt: "#791F1F" },
  2: { bg: "#FAEEDA", txt: "#633806" },
  3: { bg: "#EAF3DE", txt: "#27500A" },
};

function waitLabel(since: Date): string {
  const mins = Math.floor((Date.now() - since.getTime()) / 60000);
  if (mins < 1) return "< 1 min";
  return `${mins} min`;
}

export default function TriageResult({ patient: p }: Props) {
  const c = COLORS[p.priority];
  const hrWarn = p.hr > 100 || p.hr < 50;
  const spo2Warn = p.spo2 < 95;

  return (
    <div className="detail-root">
      {/* Header */}
      <div className="detail-header">
        <div>
          <h2 className="pd-name">{p.name}</h2>
          <p className="pd-meta">
            {p.age} años · {p.sex === "M" ? "Masculino" : "Femenino"} · espera:{" "}
            {waitLabel(p.waitSince)}
          </p>
        </div>
        <div className="prio-chip" style={{ background: c.bg, color: c.txt }}>
          {p.aiLabel}
        </div>
      </div>

      {/* Vitals */}
      <div className="vitals-grid">
        <div className="vital-card">
          <p className="vital-label">FC (lpm)</p>
          <p className={`vital-val${hrWarn ? " warn" : ""}`}>{p.hr}</p>
        </div>
        <div className="vital-card">
          <p className="vital-label">SpO₂ (%)</p>
          <p className={`vital-val${spo2Warn ? " warn" : ""}`}>{p.spo2}</p>
        </div>
        <div className="vital-card">
          <p className="vital-label">T.A.</p>
          <p className="vital-val">{p.bp}</p>
        </div>
      </div>

      {/* Symptoms */}
      {p.symptoms.length > 0 && (
        <div className="symptoms-row">
          {p.symptoms.map((s) => (
            <span key={s} className="symptom-chip">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Complaint */}
      <div className="complaint-block">
        <p className="complaint-label">motivo de consulta</p>
        <p className="complaint-text">{p.complaint}</p>
      </div>

      {/* AI result */}
      <div className="ai-result" style={{ background: c.bg }}>
        <div className="ai-icon">🤖</div>
        <div>
          <p className="ai-sublabel" style={{ color: c.txt }}>
            clasificación IA · Anthropic
          </p>
          <p className="ai-priority" style={{ color: c.txt }}>
            {p.aiLabel}
          </p>
          <p className="ai-conf" style={{ color: c.txt }}>
            confianza: {p.confidence}%
          </p>
        </div>
      </div>
    </div>
  );
}
