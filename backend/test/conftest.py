# backend/tests/conftest.py

import uuid
from datetime import datetime
from unittest.mock import MagicMock


def _fake_patient():
    p = MagicMock()
    p.id         = uuid.uuid4()
    p.age        = 55
    p.symptoms   = ["chest pain", "shortness of breath"]
    p.priority   = 1
    p.label      = "immediate"
    p.reason     = "Possible cardiovascular emergency"
    p.red_flags  = ["chest pain"]
    p.confidence = 0.95
    p.event_hash = "a" * 64
    p.seen_at    = None
    p.created_at = datetime.utcnow()
    return p


def _fake_queue_entry(priority=1, position=1, status="waiting"):
    e = MagicMock()
    e.id          = uuid.uuid4()
    e.patient_id  = uuid.uuid4()
    e.priority    = priority
    e.position    = position
    e.status      = status
    e.enqueued_at = datetime.utcnow()
    return e
