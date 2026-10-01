"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Field, fieldDescribedBy } from "@/components/form/Field";
import { INTEREST_OPTIONS } from "@/content/sales";
import { CONTACT } from "@/content/site";
import { copyPlainText } from "@/lib/clipboard";
import {
  COMPANY_MAX,
  EMAIL_MAX,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  buildInquiryMailto,
  inquiryPlainText,
  validateInquiry,
  type InquiryField,
  type InquiryInput,
  type InquiryMailto,
} from "./mailto";
import styles from "./InquiryForm.module.css";

const EMPTY: InquiryInput = { name: "", email: "", company: "", interest: "", message: "" };

/** A hibás mezők sorrendje és a fókuszálható elem azonosítója. */
const FOCUS_ORDER: readonly { field: InquiryField; id: string }[] = [
  { field: "name", id: "inquiry-name" },
  { field: "email", id: "inquiry-email" },
  { field: "company", id: "inquiry-company" },
  { field: "interest", id: "inquiry-interest-0" },
  { field: "message", id: "inquiry-message" },
];

type CopyState = { kind: "idle" } | { kind: "ok" | "fail"; text: string };

export function InquiryForm() {
  const [values, setValues] = useState<InquiryInput>(EMPTY);
  const [attempted, setAttempted] = useState(false);
  const [prepared, setPrepared] = useState<InquiryMailto | null>(null);
  const [copy, setCopy] = useState<CopyState>({ kind: "idle" });

  // A hibák csak az első küldési kísérlet után látszanak, utána élőben frissülnek.
  const errors = attempted ? validateInquiry(values) : {};

  function update(field: InquiryField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValues((current) => ({ ...current, [field]: value }));
      setPrepared(null);
      setCopy({ kind: "idle" });
    };
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    const found = validateInquiry(values);
    const firstInvalid = FOCUS_ORDER.find((entry) => found[entry.field]);
    if (firstInvalid) {
      setPrepared(null);
      document.getElementById(firstInvalid.id)?.focus();
      return;
    }
    const mail = buildInquiryMailto(values);
    setPrepared(mail);
    setCopy({ kind: "idle" });
    window.location.href = mail.href;
  }

  async function copyText(text: string, label: string) {
    const ok = await copyPlainText(text);
    setCopy(
      ok
        ? { kind: "ok", text: `${label} a vágólapra másolva.` }
        : { kind: "fail", text: "A másolás nem sikerült. Jelölje ki és másolja ki a szöveget az alábbi mezőből." },
    );
  }

  const messageLength = values.message.replace(/\r\n/g, "\n").length;
  const plainText = prepared ? inquiryPlainText(prepared) : "";

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Részletes bemutató kérése">
        <p className={styles.required}>Az „opcionális” jelzés nélküli mezők kitöltése szükséges.</p>

        <div className={styles.row}>
          <Field id="inquiry-name" label="Név" error={errors.name}>
            <input
              id="inquiry-name"
              name="name"
              type="text"
              className="hvh-input"
              autoComplete="name"
              maxLength={NAME_MAX * 2}
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
              maxLength={EMAIL_MAX * 2}
              value={values.email}
              onChange={update("email")}
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={fieldDescribedBy("inquiry-email", { error: !!errors.email })}
            />
          </Field>
        </div>

        <Field id="inquiry-company" label="Cég" optional error={errors.company}>
          <input
            id="inquiry-company"
            name="company"
            type="text"
            className="hvh-input"
            autoComplete="organization"
            maxLength={COMPANY_MAX * 2}
            value={values.company}
            onChange={update("company")}
            aria-invalid={errors.company ? true : undefined}
            aria-describedby={fieldDescribedBy("inquiry-company", { error: !!errors.company })}
          />
        </Field>

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

        <Field
          id="inquiry-message"
          label="Rövid üzenet"
          hint={`Legalább ${MESSAGE_MIN}, legfeljebb ${MESSAGE_MAX} karakter.`}
          error={errors.message}
        >
          <textarea
            id="inquiry-message"
            name="message"
            className="hvh-textarea"
            rows={6}
            maxLength={MESSAGE_MAX + 200}
            value={values.message}
            onChange={update("message")}
            aria-required="true"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={fieldDescribedBy("inquiry-message", { hint: true, error: !!errors.message })}
          />
          <p className={styles.counter} aria-hidden="true">
            {messageLength} / {MESSAGE_MAX}
          </p>
        </Field>

        <div className={styles.submitRow}>
          <button type="submit" className="hvh-btn">
            Email megnyitása
          </button>
          <p className={styles.submitNote}>
            A kitöltött adatokkal megnyitja a levelezőalkalmazását; a levelet Ön küldi el onnan.
          </p>
        </div>
      </form>

      {prepared ? (
        <div className={styles.prepared}>
          <p className="hvh-notice" role="status">
            Ha a levelezőalkalmazása megnyílt, ott ellenőrizheti és elküldheti a levelet.
          </p>
          <div className={styles.fallback}>
            <h3>Ha nem nyílt meg levelező:</h3>
            <div className={styles.copyActions}>
              <button
                type="button"
                className="hvh-btn hvh-btn--secondary hvh-btn--sm"
                onClick={() => copyText(CONTACT.email, "A címzett")}
              >
                Címzett másolása
              </button>
              <button
                type="button"
                className="hvh-btn hvh-btn--secondary hvh-btn--sm"
                onClick={() => copyText(plainText, "A levél")}
              >
                Levél másolása
              </button>
            </div>
            <p className={copy.kind === "fail" ? styles.copyFail : styles.copyOk} aria-live="polite">
              {copy.kind === "idle" ? "" : copy.text}
            </p>
            <p className={styles.recipient}>
              Címzett: <strong>{CONTACT.email}</strong>
            </p>
            <label className="hvh-label" htmlFor="inquiry-prepared-text">
              Az előkészített levél szövege
            </label>
            <textarea
              id="inquiry-prepared-text"
              className={`hvh-textarea ${styles.preparedText}`}
              readOnly
              rows={10}
              value={plainText}
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
