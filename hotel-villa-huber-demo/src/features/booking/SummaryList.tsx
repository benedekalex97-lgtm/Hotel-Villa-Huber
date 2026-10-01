import type { ReactNode } from "react";
import {
  formatGuestsHu,
  formatNightsHu,
  formatPeriodHu,
  nightsBetween,
  parseIsoDate,
  type BookingQuery,
  type GuestDetails,
  type Offer,
} from "./model";
import { SampleBadge } from "./DemoNotice";
import type { StepId } from "./flow-state";
import styles from "./BookingFlow.module.css";

interface SummaryListProps {
  query: BookingQuery;
  offer: Offer | null;
  guest?: GuestDetails;
  /** A még ismeretlen sorok elrejtése (oldalsó összefoglaló). */
  hideEmpty?: boolean;
  /** Ha megadott, a sorok mellett „Módosítás” gombok jelennek meg. */
  onEdit?: (step: StepId) => void;
}

interface Row {
  key: string;
  term: string;
  value: ReactNode;
  edit?: { step: StepId; label: string };
}

export function SummaryList({ query, offer, guest, hideEmpty = false, onEdit }: SummaryListProps) {
  const datesKnown = parseIsoDate(query.arrival) !== null && parseIsoDate(query.departure) !== null;
  const nights = nightsBetween(query.arrival, query.departure);
  const fullName = guest ? `${guest.lastName.trim()} ${guest.firstName.trim()}`.trim() : "";

  const rows: Row[] = [
    {
      key: "period",
      term: "Időszak",
      value: datesKnown ? formatPeriodHu(query.arrival, query.departure) : null,
      edit: { step: 1, label: "Időszak módosítása" },
    },
    { key: "nights", term: "Éjszakák", value: nights > 0 ? formatNightsHu(nights) : null },
    {
      key: "guests",
      term: "Vendégek",
      value: Number.isFinite(query.adults) && Number.isFinite(query.children) ? formatGuestsHu(query.adults, query.children) : null,
      edit: { step: 2, label: "Vendégek módosítása" },
    },
    { key: "rooms", term: "Szobák", value: Number.isFinite(query.rooms) ? `${query.rooms} szoba` : null },
    {
      key: "offer",
      term: "Elhelyezés",
      value: offer ? (
        <span className={styles.offerValue}>
          {offer.title}
          {offer.demo ? <SampleBadge /> : null}
        </span>
      ) : null,
      edit: { step: 3, label: "Elhelyezés módosítása" },
    },
  ];

  if (guest) {
    rows.push(
      { key: "name", term: "Vendég neve", value: fullName || null, edit: { step: 4, label: "Vendégadatok módosítása" } },
      { key: "email", term: "Email", value: guest.email.trim() || null },
      { key: "phone", term: "Telefon", value: guest.phone.trim() || null },
      { key: "notes", term: "Megjegyzés", value: guest.notes.trim() || null },
    );
  }

  const shown = rows.filter((row) => !(row.value === null && (hideEmpty || ["phone", "notes"].includes(row.key))));

  return (
    <dl className={`${styles.summary} ${hideEmpty ? styles.summaryCompact : ""}`}>
      {shown.map((row) => (
        <div key={row.key} className={styles.summaryRow}>
          <dt>{row.term}</dt>
          <dd>{row.value ?? "—"}</dd>
          {onEdit && row.edit ? (
            <dd className={styles.summaryEdit}>
              <button type="button" className="hvh-btn hvh-btn--ghost hvh-btn--sm" onClick={() => onEdit(row.edit!.step)} aria-label={row.edit.label}>
                Módosítás
              </button>
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
