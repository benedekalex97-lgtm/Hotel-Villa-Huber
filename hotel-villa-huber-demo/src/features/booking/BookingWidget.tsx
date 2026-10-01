"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROUTES } from "@/content/site";
import { CountFields, DateFields, fieldId, focusField } from "./fields";
import { DemoNotice } from "./DemoNotice";
import {
  DEFAULT_QUERY,
  firstErrorKey,
  QUERY_FIELD_ORDER,
  queryToSearchParams,
  validateQuery,
  type BookingQuery,
  type QueryErrors,
} from "./model";
import { useToday } from "./useToday";
import styles from "./BookingWidget.module.css";

const PREFIX = "widget";

/**
 * Kompakt keresőűrlap a főoldalon. A /foglalas címre navigál, az URL csak dátumokat és darabszámokat tartalmaz.
 * JavaScript nélkül a form natív GET-kérésként ugyanoda mutat.
 */
export function BookingWidget() {
  const router = useRouter();
  const today = useToday();
  const [query, setQuery] = useState<BookingQuery>(DEFAULT_QUERY);
  const [errors, setErrors] = useState<QueryErrors>({});

  function update(patch: Partial<BookingQuery>) {
    setQuery((q) => ({ ...q, ...patch }));
    const cleared = Object.keys(patch) as (keyof BookingQuery)[];
    if (cleared.some((key) => errors[key])) {
      setErrors((e) => {
        const next = { ...e };
        for (const key of cleared) delete next[key];
        return next;
      });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateQuery(query, today);
    setErrors(found);
    const first = firstErrorKey(found, QUERY_FIELD_ORDER);
    if (first) {
      focusField(fieldId(PREFIX, first));
      return;
    }
    router.push(`${ROUTES.booking}?${queryToSearchParams(query).toString()}`);
  }

  return (
    <div className={styles.widget}>
      <DemoNotice />
      <form className={styles.form} action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${ROUTES.booking}`} method="get" noValidate aria-label="Elérhetőség keresése" onSubmit={onSubmit}>
        <div className={styles.fields}>
          <DateFields prefix={PREFIX} query={query} errors={errors} today={today} onChange={update} />
          <CountFields prefix={PREFIX} query={query} errors={errors} onChange={update} />
        </div>
        <button type="submit" className={`hvh-btn ${styles.submit}`}>
          Elérhetőség megtekintése
        </button>
      </form>
      <p className={styles.fine}>Nem kötelez semmire: a bemutató folyamat nem küld el és nem ment adatot.</p>
    </div>
  );
}
