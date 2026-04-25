"use client";

import { useState } from "react";

type Sex = "M" | "F";

interface FormData {
  name: string;
  age: number;
  sex: Sex;
  hr: number;
  spo2: number;
  bp: string;
  complaint: string;
  symptoms: string[];
}

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}

const SYMPTOM_OPTIONS = [
  "dolor torácico",
  "disnea",
  "fiebre",
  "cefalea",
  "náuseas",
  "trauma",
  "pérd. consciencia",
  "convulsiones",
];

const EMPTY: FormData = {
  name: "",
  age: 0,
  sex: "M",
  hr: 0,
  spo2: 0,
  bp: "",
  complaint: "",
  symptoms: [],
};

export default function PatientForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [loadingStep, setLoadingStep] = useState<"ai" | "chain" | null>(null);

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleSymptom(s: string) {
    set(
      "symptoms",
      form.symptoms.includes(s)
        ? form.symptoms.filter((x) => x !== s)
        : [...form.symptoms, s]
    );
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;
    setLoadingStep("ai");
    await new Promise((r) => setTimeout(r, 900));
    setLoadingStep("chain");
    await onSubmit(form);
    setLoadingStep(null);
    setForm(EMPTY);
  }

  const btnLabel =
    loadingStep === "ai"
      ? "Clasificando con IA…"
      : loadingStep === "chain"
      ? "Registrando en Monad…"
      : "Clasificar con IA + registrar en Monad";

  return (
    <div className="form-root">
      <div className="form-header">
        <span className="section-label">Nuevo paciente</span>
      </div>

      <div className="form-body">
        {/* Row: name + age + sex */}
        <div className="row-3">
          <div className="field" style={{ gridColumn: "1 / 2" }}>
            <label className="flabel">Nombre completo</label>
            <input
              className="finput"
              type="text"
              placeholder="Ana García…"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="field">
            <label className="flabel">Edad</label>
            <input
              className="finput"
              type="number"
              placeholder="45"
              value={form.age || ""}
              onChange={(e) => set("age", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="field">
            <label className="flabel">Sexo</label>
            <select
              className="finput"
              value={form.sex}
              onChange={(e) => set("sex", e.target.value as Sex)}
            >
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
        </div>

        {/* Row: vitals */}
        <div className="row-3">
          <div className="field">
            <label className="flabel">FC (lpm)</label>
            <input
              className="finput"
              type="number"
              placeholder="88"
              value={form.hr || ""}
              onChange={(e) => set("hr", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="field">
            <label className="flabel">SpO₂ (%)</label>
            <input
              className="finput"
              type="number"
              placeholder="97"
              value={form.spo2 || ""}
              onChange={(e) => set("spo2", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="field">
            <label className="flabel">T.A.</label>
            <input
              className="finput"
              type="text"
              placeholder="120/80"
              value={form.bp}
              onChange={(e) => set("bp", e.target.value)}
            />
          </div>
        </div>

        {/* Symptoms */}
        <div className="field">
          <label className="flabel">Síntomas</label>
          <div className="chips">
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s}
                className={`chip${form.symptoms.includes(s) ? " chip-on" : ""}`}
                onClick={() => toggleSymptom(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Complaint */}
        <div className="field">
          <label className="flabel">Motivo de consulta</label>
          <textarea
            className="finput ftextarea"
            placeholder="Describa brevemente el motivo…"
            value={form.complaint}
            onChange={(e) => set("complaint", e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !form.name.trim()}
          type="button"
        >
          {loading && <span className="spinner" />}
          <span>{btnLabel}</span>
        </button>
      </div>
    </div>
  );
}
