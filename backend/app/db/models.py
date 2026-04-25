# backend/app/db/models.py

from sqlalchemy import (
    Column, String, Integer, Float,
    DateTime, ARRAY, ForeignKey, text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime
import uuid


class Base(DeclarativeBase):
    pass


class Patient(Base):
    __tablename__ = "patients"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    age        = Column(Integer, nullable=False)
    symptoms   = Column(ARRAY(String), nullable=False)
    priority   = Column(Integer, nullable=False)
    label      = Column(String(20), nullable=False)
    reason     = Column(String(300), nullable=True)
    red_flags  = Column(ARRAY(String), nullable=True, default=[])
    confidence = Column(Float, nullable=False)
    event_hash = Column(String(64), nullable=True)   # SHA-256 hex
    seen_at    = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False,
                        server_default=text("now()"))

    # Vastazos rapidos opcioneales (se almacenan planos por simplicidad)
    vitals_bp   = Column(String(10), nullable=True)
    vitals_hr   = Column(Integer,    nullable=True)
    vitals_temp = Column(Float,      nullable=True)
    vitals_spo2 = Column(Integer,    nullable=True)

    # Relación
    queue_entry = relationship("QueueEntry", back_populates="patient",
                               uselist=False, cascade="all, delete-orphan")


class QueueEntry(Base):
    __tablename__ = "queue"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id",
                        ondelete="CASCADE"), nullable=False, unique=True)
    priority   = Column(Integer, nullable=False)
    position   = Column(Integer, nullable=False)
    status     = Column(String(20), nullable=False, server_default="waiting")
    enqueued_at = Column(DateTime(timezone=True), nullable=False,
                         server_default=text("now()"))

    # Relacion
    patient = relationship("Patient", back_populates="queue_entry")
