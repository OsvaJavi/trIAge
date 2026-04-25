"use client";

import type { Patient, Priority } from "@/app/page";

interface Props {
  patients: Patient[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const PRIO_CLASSES: Record<Priority, string> = {
  1: "badge-p1",
  2: "badge-p2",
  3: "badge-p3",
};

const PRIO_LABELS: Record<Priority, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
};

function waitLabel(since: Date): string {
  const mins = Math.floor((Date.now() - since.getTime()) / 60000);
  if (mins < 1) return "< 1 min";
  return `${mins} min`;
}

export default function QueueBoard({ patients, selectedId, onSelect }: Props) {
  const sorted = [...patients].sort((a, b) => a.priority - b.priority);

  return (
    <div className="queue-root">
      <div className="queue-header">
        <span className="section-label">Cola de espera</span>
        <span className="section-count">{patients.length} pacientes</span>
      </div>

      <div className="queue-list">
        {sorted.map((p) => (
          <button
            key={p.id}
            className={`queue-item${selectedId === p.id ? " active" : ""}`}
            onClick={() => onSelect(p.id)}
          >
            <div className={`prio-badge ${PRIO_CLASSES[p.priority]}`}>
              {PRIO_LABELS[p.priority]}
            </div>
            <div className="q-info">
              <p className="q-name">{p.name}</p>
              <p className="q-complaint">
                {p.complaint.length > 40
                  ? p.complaint.slice(0, 40) + "…"
                  : p.complaint}
              </p>
            </div>
            <div className="q-wait">{waitLabel(p.waitSince)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
