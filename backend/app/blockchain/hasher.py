# backend/app/blockchain/hasher.py

import hashlib
import json
from datetime import datetime


def build_event_hash(payload: dict) -> str:
    """
    Construye un SHA-256 hash del evento de triage.
    Solo incluye datos no médicos — nunca síntomas ni diagnósticos.

    Campos permitidos: patient_id, priority, timestamp.
    """
    safe_payload = {
        "patient_id": str(payload["patient_id"]),
        "priority":   int(payload["priority"]),
        "timestamp":  str(payload.get("timestamp", datetime.utcnow().isoformat())),
    }

    canonical = json.dumps(safe_payload, sort_keys=True, ensure_ascii=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
