# backend/app/api/triage.py

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.schemas import PatientInput, TriageResponse
from app.core.exceptions import TriageException
from app.ai.classifier import classify_patient
from app.ai.validator import validate_triage_output
from app.db.session import get_db
from app.db.crud import create_patient, enqueue_patient
from app.blockchain.hasher import build_event_hash
from app.blockchain.logger import log_hash_to_chain

router = APIRouter()


@router.post("/triage", response_model=TriageResponse, status_code=201)
async def triage_patient(
    payload: PatientInput,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Classify a patient's urgency level using AI and add them to the queue.
    Does NOT diagnose. Does NOT suggest treatment.
    Returns a triage level 1–5 with clinical reasoning.
    """

    # 1. AI classification
    raw_result = await classify_patient(payload)

    # 2. Validate + sanitize LLM output (never trust raw model JSON)
    triage_result = validate_triage_output(raw_result)
    if not triage_result:
        raise TriageException(
            status_code=502,
            message="AI classifier returned an invalid response. Please retry.",
            code="AI_INVALID_OUTPUT",
        )

    # 3. Persist patient + triage result
    patient = await create_patient(db, payload, triage_result)

    # 4. Add to priority queue
    queue_entry = await enqueue_patient(db, patient.id, triage_result.priority)

    # 5. Build event hash (off-chain — no medical data goes to blockchain)
    event_hash = build_event_hash({
        "patient_id": str(patient.id),
        "priority":   triage_result.priority,
        "timestamp":  datetime.utcnow().isoformat(),
    })

    # 6. Log hash to Monad asynchronously — never blocks the response
    background_tasks.add_task(log_hash_to_chain, event_hash)

    return TriageResponse(
        patient_id=str(patient.id),
        priority=triage_result.priority,
        label=triage_result.label,
        reason=triage_result.reason,
        red_flags=triage_result.red_flags,
        confidence=triage_result.confidence,
        queue_position=queue_entry.position,
        event_hash=event_hash,
        timestamp=datetime.utcnow(),
    )
