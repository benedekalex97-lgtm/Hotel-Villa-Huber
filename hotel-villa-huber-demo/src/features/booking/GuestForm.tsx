import { Field, fieldDescribedBy } from "@/components/form/Field";
import type { GuestDetails, GuestErrors } from "./model";
import styles from "./BookingFlow.module.css";

interface GuestFormFieldsProps {
  guest: GuestDetails;
  errors: GuestErrors;
  onChange: (patch: Partial<GuestDetails>) => void;
}

export const GUEST_FIELD_IDS: Record<keyof GuestDetails, string> = {
  firstName: "guest-firstName",
  lastName: "guest-lastName",
  email: "guest-email",
  phone: "guest-phone",
  notes: "guest-notes",
};

function describedBy(key: keyof GuestDetails, errors: GuestErrors, hint = false) {
  return fieldDescribedBy(GUEST_FIELD_IDS[key], { hint, error: Boolean(errors[key]) });
}

/** A vendégadat-űrlap mezői. Az adat csak a szülő React-állapotában él; nincs mentés, nincs küldés. */
export function GuestFormFields({ guest, errors, onChange }: GuestFormFieldsProps) {
  const ids = GUEST_FIELD_IDS;
  return (
    <div className={styles.guestGrid}>
      <Field id={ids.lastName} label="Vezetéknév" error={errors.lastName}>
        <input
          id={ids.lastName}
          className="hvh-input"
          type="text"
          autoComplete="family-name"
          value={guest.lastName}
          aria-invalid={errors.lastName ? true : undefined}
          aria-describedby={describedBy("lastName", errors)}
          onChange={(event) => onChange({ lastName: event.target.value })}
        />
      </Field>
      <Field id={ids.firstName} label="Keresztnév" error={errors.firstName}>
        <input
          id={ids.firstName}
          className="hvh-input"
          type="text"
          autoComplete="given-name"
          value={guest.firstName}
          aria-invalid={errors.firstName ? true : undefined}
          aria-describedby={describedBy("firstName", errors)}
          onChange={(event) => onChange({ firstName: event.target.value })}
        />
      </Field>
      <Field id={ids.email} label="Email-cím" error={errors.email} className={styles.wide}>
        <input
          id={ids.email}
          className="hvh-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={guest.email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email", errors)}
          onChange={(event) => onChange({ email: event.target.value })}
        />
      </Field>
      <Field id={ids.phone} label="Telefonszám" optional error={errors.phone} className={styles.wide}>
        <input
          id={ids.phone}
          className="hvh-input"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={guest.phone}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone", errors)}
          onChange={(event) => onChange({ phone: event.target.value })}
        />
      </Field>
      <Field
        id={ids.notes}
        label="Megjegyzés"
        optional
        hint="Egészségügyi vagy más érzékeny adatot ne írjon ide."
        error={errors.notes}
        className={styles.wide}
      >
        <textarea
          id={ids.notes}
          className="hvh-textarea"
          rows={4}
          value={guest.notes}
          aria-invalid={errors.notes ? true : undefined}
          aria-describedby={describedBy("notes", errors, true)}
          onChange={(event) => onChange({ notes: event.target.value })}
        />
      </Field>
    </div>
  );
}
