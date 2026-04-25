"use client";

import type { ChainTx, Priority } from "@/app/page";

interface Props {
  txLog: ChainTx[];
}

const PRIO_COLORS: Record<Priority, { bg: string; txt: string }> = {
  1: { bg: "#FCEBEB", txt: "#791F1F" },
  2: { bg: "#FAEEDA", txt: "#633806" },
  3: { bg: "#EAF3DE", txt: "#27500A" },
};

function timeLabel(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `hace ${hrs}h`;
}

export default function TxStatus({ txLog }: Props) {
  return (
    <div className="tx-root">
      <div className="tx-header">
        <span className="section-label">Blockchain log · Monad</span>
        <span className="section-count">{txLog.length} tx</span>
      </div>

      <div className="tx-list">
        {txLog.length === 0 ? (
          <div className="tx-empty">Sin transacciones registradas</div>
        ) : (
          txLog.map((tx) => {
            const c = PRIO_COLORS[tx.priority];
            const isConfirmed = tx.status === "confirmed";
            return (
              <div key={tx.hash} className="tx-entry">
                <div className="tx-row-top">
                  <span className="tx-hash">{tx.hash}</span>
                  <span
                    className="tx-status"
                    style={{
                      background: isConfirmed ? "#EAF3DE" : "#FAEEDA",
                      color: isConfirmed ? "#27500A" : "#633806",
                    }}
                  >
                    {isConfirmed ? "✓ confirmed" : "⏳ pending"}
                  </span>
                </div>
                <div className="tx-row-bottom">
                  <span className="tx-patient">{tx.patientName}</span>
                  <span
                    className="tx-prio"
                    style={{ background: c.bg, color: c.txt }}
                  >
                    {tx.aiLabel}
                  </span>
                  <span className="tx-time">{timeLabel(tx.timestamp)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
