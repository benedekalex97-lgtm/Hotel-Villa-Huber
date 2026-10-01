"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Field, fieldDescribedBy } from "@/components/form/Field";
import { INTEREST_OPTIONS, REQUEST_OPTIONS } from "@/content/sales";
import { CONTACT } from "@/content/site";
import type { DeliveryMode } from "@/features/inquiry/delivery";
import { submitInquiry } from "@/features/inquiry/client";
import {
  EMPTY_INQUIRY,
  LIMITS,
  buildInquiryMailto,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryInput,
  type InquiryMailto,
} from "@/features/inquiry/schema";
import { trackMeasurement } from "@/features/measurement/events";
import { PreparedMail } from "./PreparedMail";
import styles from "./InquiryForm.module.css";

/** A hibás mezők sorrendje, a fókuszálható elem azonosítója és a hibaösszegző címkéje. */
const FIELD_ORDER: readonly { field: InquiryField; id: string; label: string }[] = [
  { field: "name", id: "inquiry-name", label: "Név" },
  { field: "email", id: "inquiry-email", label: "Email" },
  { field: "phone", id: "inquiry-phone", label: "Telefon" },
  { field: "company", id: "inquiry-company", label: "Cég" },
  { field: "interest", id: "inquiry-interest-0", label: "Érdeklődési irány" },
  { field: "request", id: "inquiry-request-0", label: "Kérés" },
  { field: "message", id: "inquiry-message", label: "Rövid üzenet" },
];

type Phase = "idle" | "sending" | "accepted";
type ErrorNotice = null | "rate_limited" | "unavailable";

export function InquiryForm({ deliveryMode }: { deliveryMode: DeliveryMode }) {
  const [values, setValues] = useState<InquiryInput>(EMPTY_INQUIRY);
  const [website, setWebsite] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [serverErrors, setServerErrors] = useState<InquiryErrors>({});
  const [notice, setNotice] = useState<ErrorNotice>(null);
  const [prepared, setPrepared] = useState<InquiryMailto | null>(null);
  const startedAt = useRef(0);
  const measurementStarted = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Az űrlap megjelenésének ideje — a szerver ebből szűri a túl gyors, automatikus beküldést.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (phase === "accepted") successRef.current?.focus();
  }, [phase]);

  // A hibák csak az első küldési kísérlet után látszanak, utána élőben frissülnek.
  const clientErrors: InquiryErrors = attempted ? validateInquiry(values) : {};
  const errors: InquiryErrors = { ...serverErrors, ...clientErrors };
  const errorList = FIELD_ORDER.filter((entry) => errors[entry.field]);

  function update(field: InquiryField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!measurementStarted.current) { trackMeasurement("form_start"); measurementStarted.current = true; }
      const value = event.target.value;
      setValues((current) => ({ ...current, [field]: value }));
      setServerErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
      setPrepared(null);
      setNotice(null);
    };
  }

  function focusFirst(found: InquiryErrors) {
    const first = FIELD_ORDER.find((entry) => found[entry.field]);
    if (first) document.getElementById(first.id)?.focus();
    return Boolean(first);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "sending") return;
    setAttempted(true);
    setNotice(null);
    setPrepared(null);

    const found = validateInquiry(values);
    if (focusFirst(found)) return;

    if (deliveryMode === "mailto") {
      // Nincs szerveres küldés: a levelezőalkalmazás nyílik meg, a levelet a látogató küldi el.
      const mail = buildInquiryMailto(values);
      setPrepared(mail);
      trackMeasurement("inquiry_mailto_open");
      window.location.href = mail.href;
      return;
    }

    setPhase("sending");
    const result = await submitInquiry(values, { startedAt: startedAt.current, website });
    switch (result.status) {
      case "accepted":
        trackMeasurement("generate_lead");
        setPhase("accepted");
        return;
      case "invalid":
        setServerErrors(result.errors);
        setPhase("idle");
        focusFirst(result.errors);
        return;
      case "rate_limited":
        setNotice("rate_limited");
        setPhase("idle");
        return;
      default:
        // not_configured, failed: a kérés nem ment el — tartalék: előkészített levél.
        setNotice("unavailable");
        setPrepared(buildInquiryMailto(values));
        setPhase("idle");
    }
  }

  const messageLength = values.message.replace(/\r\n/g, "\n").length;
  const sending = phase === "sending";

  if (phase === "accepted") {
    return (
      <div className={styles.success} role="status" tabIndex={-1} ref={successRef}>
        <h3>Köszönjük a megkeresést</h3>
        <p>Kérését továbbítottuk az értékesítési csapatnak. Hamarosan jelentkezünk a megadott elérhetőségen.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Részletes bemutató és egyeztetés kérése" aria-busy={sending}>
        <p className={styles.purpose}>
          Az űrlappal részletes tájékoztatást, telefonos egyeztetést vagy helyszíni megtekintést kérhet. Nem vételi ajánlat, és nem kötelez semmire.
        </p>
        <p className={styles.required}>Az „opcionális” jelzés nélküli mezők kitöltése szükséges.</p>

        {errorList.length > 0 ? (
          <div className={`hvh-notice hvh-notice--danger ${styles.summary}`}>
            <strong>Kérjük, javítsa a jelölt mezőket:</strong>
            <ul>
              {errorList.map((entry) => (
                <li key={entry.field}>
                  <a href={`#${entry.id}`}>
                    {entry.label}: {errors[entry.field]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={styles.row}>
          <Field id="inquiry-name" label="Név" error={errors.name}>
            <input
              id="inquiry-name"
              name="name"
              type="text"
              className="hvh-input"
              autoComplete="name"
              maxLength={LIMITS.nameMax * 2}
              value={values.name}
              onChange={update("name")}
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={fieldDescribedBy("inquiry-name", { error: !!errors.name })}
            />
          </Field>
          <Field id="inquiry-email" label="Email" error={errors.email}>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              inputMode="email"
              className="hvh-input"
              autoComplete="email"
              maxLength={LIMITS.emailMax * 2}
              value={values.email}
              onChange={update("email")}
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={fieldDescribedBy("inquiry-email", { error: !!errors.email })}
            />
          </Field>
        </div>

        <div className={styles.row}>
          <Field id="inquiry-phone" label="Telefon" optional error={errors.phone}>
            <input
              id="inquiry-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              className="hvh-input"
              autoComplete="tel"
              maxLength={LIMITS.phoneMax * 2}
              value={values.phone}
              onChange={update("phone")}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={fieldDescribedBy("inquiry-phone", { error: !!errors.phone })}
            />
          </Field>
          <Field id="inquiry-company" label="Cég" optional error={errors.company}>
            <input
              id="inquiry-company"
              name="company"
              type="text"
              className="hvh-input"
              autoComplete="organization"
              maxLength={LIMITS.companyMax * 2}
              value={values.company}
              onChange={update("company")}
              aria-invalid={errors.company ? true : undefined}
              aria-describedby={fieldDescribedBy("inquiry-company", { error: !!errors.company })}
            />
          </Field>
        </div>

        <fieldset
          className={styles.fieldset}
          role="radiogroup"
          aria-required="true"
          aria-invalid={errors.interest ? true : undefined}
          aria-describedby={errors.interest ? "inquiry-interest-error" : undefined}
        >
          <legend className="hvh-label">Érdeklődési irány</legend>
          <div className={styles.choices}>
            {INTEREST_OPTIONS.map((option, i) => (
              <label key={option.value} className="hvh-choice">
                <input
                  id={`inquiry-interest-${i}`}
                  type="radio"
                  name="interest"
                  value={option.value}
                  checked={values.interest === option.value}
                  onChange={update("interest")}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors.interest ? (
            <p className="hvh-error" id="inquiry-interest-error">
              <span aria-hidden="true">!</span>
              <span>{errors.interest}</span>
            </p>
          ) : null}
        </fieldset>

        <fieldset
          className={styles.fieldset}
          role="radiogroup"
          aria-required="true"
          aria-invalid={errors.request ? true : undefined}
          aria-describedby={errors.request ? "inquiry-request-error" : undefined}
        >
          <legend className="hvh-label">Kérés</legend>
          <div className={styles.choices}>
            {REQUEST_OPTIONS.map((option, i) => (
              <label key={option.value} className="hvh-choice">
                <input
                  id={`inquiry-request-${i}`}
                  type="radio"
                  name="request"
                  value={option.value}
                  checked={values.request === option.value}
                  onChange={update("request")}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors.request ? (
            <p className="hvh-error" id="inquiry-request-error">
              <span aria-hidden="true">!</span>
              <span>{errors.request}</span>
            </p>
          ) : null}
        </fieldset>

        <Field
          id="inquiry-message"
          label="Rövid üzenet"
          hint={`Legalább ${LIMITS.messageMin}, legfeljebb ${LIMITS.messageMax} karakter.`}
          error={errors.message}
        >
          <textarea
            id="inquiry-message"
            name="message"
            className="hvh-textarea"
            rows={6}
            maxLength={LIMITS.messageMax + 200}
            value={values.message}
            onChange={update("message")}
            aria-required="true"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={fieldDescribedBy("inquiry-message", { hint: true, error: !!errors.message })}
          />
          <p className={styles.counter} aria-hidden="true">
            {messageLength} / {LIMITS.messageMax}
          </p>
        </Field>

        {/* Méhkas: emberi látogató nem látja és nem tölti ki. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Ezt a mezőt hagyja üresen
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
        </div>

        <div className={styles.submitArea}>
          <div className={styles.submitRow}>
            <button type="submit" className="hvh-btn" disabled={sending} aria-busy={sending}>
              {deliveryMode === "server" ? (sending ? "Küldés…" : "Kérés elküldése") : "Email előkészítése"}
            </button>
            {deliveryMode === "mailto" ? (
              <p className={styles.explain}>
                Az űrlap a levelezőalkalmazásában előkészít egy emailt a {CONTACT.email} címre. A levelet Ön küldi el; az oldal nem küldi el és nem tárolja.
              </p>
            ) : null}
          </div>
          <p className={styles.dataNote}>
            {deliveryMode === "mailto"
              ? "Az űrlapon megadott adatokat az oldal nem tárolja és nem küldi el sehová; azok csak az Ön levelezőalkalmazásában előkészített levélben szerepelnek."
              : "Az űrlapon megadott adatokat kizárólag ennek a kérésnek a feldolgozásához továbbítjuk az értékesítési címre; az oldal nem tárolja őket."}
          </p>
        </div>
      </form>

      {notice === "rate_limited" ? (
        <p className="hvh-notice hvh-notice--danger" role="alert">
          <strong>A kérést most nem tudtuk fogadni.</strong>
          <span>Rövid időn belül túl sok kérés érkezett. Kérjük, próbálja újra néhány perc múlva.</span>
        </p>
      ) : null}

      {notice === "unavailable" ? (
        <p className="hvh-notice hvh-notice--danger" role="alert">
          <strong>A kérést nem sikerült elküldeni.</strong>
          <span>Az űrlap jelenleg nem tudta továbbítani a kérését. Az adatait megtartottuk a mezőkben; az alábbi előkészített levelet saját levelezőalkalmazásából is elküldheti a {CONTACT.email} címre.</span>
        </p>
      ) : null}

      {prepared ? (
        <div className={styles.prepared}>
          {deliveryMode === "mailto" ? (
            <p className="hvh-notice" role="status">
              Ha a levelezőalkalmazása megnyílt, ott ellenőrizheti és elküldheti a levelet.
            </p>
          ) : null}
          <PreparedMail mail={prepared} reopenLabel={deliveryMode === "mailto" ? "Levelezőprogram megnyitása újra" : "Levelezőprogram megnyitása"} />
        </div>
      ) : null}
    </div>
  );
}
