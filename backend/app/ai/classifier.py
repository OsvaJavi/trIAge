# backend/app/ai/classifier.py

import httpx
import json
import asyncio

from app.core.config import settings
from app.core.schemas import PatientInput
from app.ai.prompts import TRIAGE_SYSTEM_PROMPT, build_user_message

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_HEADERS = {
    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
    "Content-Type":  "application/json",
}

MAX_RETRIES  = 3
RETRY_DELAY  = 1.5


async def classify_patient(payload: PatientInput) -> dict | None:
    user_message = build_user_message(payload)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = await _call_groq(user_message)
            return result

        except httpx.TimeoutException:
            if attempt == MAX_RETRIES:
                return None
            await asyncio.sleep(RETRY_DELAY * attempt)

        except httpx.HTTPStatusError as e:
            if 400 <= e.response.status_code < 500:
                return None
            if attempt == MAX_RETRIES:
                return None
            await asyncio.sleep(RETRY_DELAY * attempt)

        except (json.JSONDecodeError, KeyError):
            return None

    return None


async def _call_groq(user_message: str) -> dict:
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            GROQ_API_URL,
            headers=GROQ_HEADERS,
            json={
                "model":       "llama3-70b-8192",
                "max_tokens":  512,
                "temperature": 0.1,  # bajo para respuestas consistentes
                "messages": [
                    {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
                    {"role": "user",   "content": user_message},
                ],
            },
        )
        response.raise_for_status()

    data = response.json()

    text = data["choices"][0]["message"]["content"].strip()

    # Strip markdown fences si el modelo las agrega
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)
