# backend/tests/test_triage.py

import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app


# Fixtures

@pytest.fixture
def valid_payload():
    return {
        "age": 55,
        "symptoms": ["chest pain", "shortness of breath"],
        "vitals": {"hr": 110, "spo2": 91}
    }

@pytest.fixture
def low_priority_payload():
    return {
        "age": 25,
        "symptoms": ["mild headache"],
    }

@pytest.fixture
def mock_triage_result():
    return {
        "priority":   1,
        "label":      "immediate",
        "reason":     "Chest pain with low SpO2 suggests cardiovascular emergency",
        "red_flags":  ["chest pain", "spo2 91%"],
        "confidence": 0.95,
    }


# Helper

async def post_triage(client: AsyncClient, payload: dict):
    return await client.post("/api/v1/triage", json=payload)


# POST /triage 

@pytest.mark.asyncio
async def test_triage_returns_201(valid_payload, mock_triage_result):
    with patch("app.ai.classifier.classify_patient", new_callable=AsyncMock) as mock_clf, \
         patch("app.db.crud.create_patient",         new_callable=AsyncMock) as mock_create, \
         patch("app.db.crud.enqueue_patient",        new_callable=AsyncMock) as mock_enqueue, \
         patch("app.blockchain.logger.log_hash_to_chain", new_callable=AsyncMock):

        mock_clf.return_value    = mock_triage_result
        mock_create.return_value = _fake_patient()
        mock_enqueue.return_value = _fake_queue_entry()

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await post_triage(client, valid_payload)

    assert response.status_code == 201
    data = response.json()
    assert data["priority"] == 1
    assert data["label"]    == "immediate"
    assert "event_hash"     in data
    assert "queue_position" in data


@pytest.mark.asyncio
async def test_triage_priority_1_on_critical_symptoms(valid_payload, mock_triage_result):
    with patch("app.ai.classifier.classify_patient", new_callable=AsyncMock) as mock_clf, \
         patch("app.db.crud.create_patient",  new_callable=AsyncMock, return_value=_fake_patient()), \
         patch("app.db.crud.enqueue_patient", new_callable=AsyncMock, return_value=_fake_queue_entry()), \
         patch("app.blockchain.logger.log_hash_to_chain", new_callable=AsyncMock):

        mock_clf.return_value = mock_triage_result

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await post_triage(client, valid_payload)

    assert response.json()["priority"] == 1


@pytest.mark.asyncio
async def test_triage_invalid_ai_output_returns_502(valid_payload):
    with patch("app.ai.classifier.classify_patient", new_callable=AsyncMock) as mock_clf:
        mock_clf.return_value = None  # simulate AI failure

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await post_triage(client, valid_payload)

    assert response.status_code == 502
    assert response.json()["code"] == "AI_INVALID_OUTPUT"


@pytest.mark.asyncio
async def test_triage_missing_symptoms_returns_422():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await post_triage(client, {"age": 30, "symptoms": []})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_triage_invalid_age_returns_422():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await post_triage(client, {"age": -1, "symptoms": ["fever"]})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_triage_event_hash_is_64_chars(valid_payload, mock_triage_result):
    with patch("app.ai.classifier.classify_patient", new_callable=AsyncMock, return_value=mock_triage_result), \
         patch("app.db.crud.create_patient",  new_callable=AsyncMock, return_value=_fake_patient()), \
         patch("app.db.crud.enqueue_patient", new_callable=AsyncMock, return_value=_fake_queue_entry()), \
         patch("app.blockchain.logger.log_hash_to_chain", new_callable=AsyncMock):

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await post_triage(client, valid_payload)

    assert len(response.json()["event_hash"]) == 64
