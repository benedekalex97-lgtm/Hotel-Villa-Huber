"use client";

import { useState } from "react";
import { Field, fieldDescribedBy } from "@/components/form/Field";
import { addDays, LIMITS, parseIsoDate, QUERY_PARAMS, type BookingQuery, type QueryErrors } from "./model";
import styles from "./fields.module.css";

interface CountFieldProps {
  id: string;
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  error?: string;
  onChange: (value: number) => void;
}

/** Számmező − / + gombokkal (≥ 44 px), natív number input a billentyűzetes és mobilos bevitelhez. */
export function CountField({ id, name, label, value, min, max, error, onChange }: CountFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (Number.isFinite(value) ? String(value) : "");
  const base = Number.isFinite(value) ? value : min;

  function bump(delta: number) {
    const next = Math.min(max, Math.max(min, base + delta));
    setDraft(null);
    onChange(next);
  }

  return (
    <Field id={id} label={label} error={error} className={styles.count}>
      <div className={styles.stepper} data-invalid={error ? "true" : undefined}>
        <button
          type="button"
          className={styles.stepBtn}
          aria-label={`${label}: csökkentés`}
          aria-disabled={base <= min}
          onClick={() => base > min && bump(-1)}
        >
          <span aria-hidden="true">−</span>
        </button>
        <input
          id={id}
          name={name}
          className={styles.countInput}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={shown}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, { error: Boolean(error) })}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            onChange(raw.trim() === "" ? Number.NaN : Number(raw));
          }}
          onBlur={() => setDraft(null)}
        />
        <button
          type="button"
          className={styles.stepBtn}
          aria-label={`${label}: növelés`}
          aria-disabled={base >= max}
          onClick={() => base < max && bump(1)}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </Field>
  );
}

interface QueryFieldsProps {
  /** Az elemazonosítók előtagja. */
  prefix: string;
  query: BookingQuery;
  errors: QueryErrors;
  today: string;
  onChange: (patch: Partial<BookingQuery>) => void;
}

export function fieldId(prefix: string, key: keyof BookingQuery): string {
  return `${prefix}-${key}`;
}

/** Érkezés és távozás (natív dátummező, `min` = ma / érkezés + 1 nap). */
export function DateFields({ prefix, query, errors, today, onChange }: QueryFieldsProps) {
  const arrivalValid = parseIsoDate(query.arrival) !== null;
  const departureMin = arrivalValid ? addDays(query.arrival, 1) : today ? addDays(today, 1) : undefined;
  return (
    <>
      <Field id={fieldId(prefix, "arrival")} label="Érkezés" error={errors.arrival}>
        <input
          id={fieldId(prefix, "arrival")}
          name={QUERY_PARAMS.arrival}
          className="hvh-input"
          type="date"
          min={today || undefined}
          value={query.arrival}
          aria-invalid={errors.arrival ? true : undefined}
          aria-describedby={fieldDescribedBy(fieldId(prefix, "arrival"), { error: Boolean(errors.arrival) })}
          onChange={(event) => onChange({ arrival: event.target.value })}
        />
      </Field>
      <Field id={fieldId(prefix, "departure")} label="Távozás" error={errors.departure}>
        <input
          id={fieldId(prefix, "departure")}
          name={QUERY_PARAMS.departure}
          className="hvh-input"
          type="date"
          min={departureMin}
          value={query.departure}
          aria-invalid={errors.departure ? true : undefined}
          aria-describedby={fieldDescribedBy(fieldId(prefix, "departure"), { error: Boolean(errors.departure) })}
          onChange={(event) => onChange({ departure: event.target.value })}
        />
      </Field>
    </>
  );
}

/** Felnőttek, gyermekek, szobák. */
export function CountFields({ prefix, query, errors, onChange }: Omit<QueryFieldsProps, "today">) {
  return (
    <>
      <CountField
        id={fieldId(prefix, "adults")}
        name={QUERY_PARAMS.adults}
        label="Felnőttek"
        value={query.adults}
        min={1}
        max={LIMITS.maxAdults}
        error={errors.adults}
        onChange={(adults) => onChange({ adults })}
      />
      <CountField
        id={fieldId(prefix, "children")}
        name={QUERY_PARAMS.children}
        label="Gyermekek"
        value={query.children}
        min={0}
        max={LIMITS.maxChildren}
        error={errors.children}
        onChange={(children) => onChange({ children })}
      />
      <CountField
        id={fieldId(prefix, "rooms")}
        name={QUERY_PARAMS.rooms}
        label="Szobák"
        value={query.rooms}
        min={1}
        max={LIMITS.maxRooms}
        error={errors.rooms}
        onChange={(rooms) => onChange({ rooms })}
      />
    </>
  );
}

/** Fókusz az első hibás mezőre a render után. */
export function focusField(id: string): void {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}
