import type { ReactNode } from "react";

interface FieldProps {
  /** A vezérlő `id`-ja; a label és a leírások ehhez kötődnek. */
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

/** A hint és hiba elemek azonosítói — a vezérlő `aria-describedby`-jához. */
export function fieldDescribedBy(id: string, opts: { hint?: boolean; error?: boolean }): string | undefined {
  const ids = [opts.hint ? `${id}-hint` : null, opts.error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

/**
 * Címkézett űrlapmező-keret. A vezérlőt (input/select/textarea) a hívó adja,
 * `aria-describedby={fieldDescribedBy(id, …)}` és `aria-invalid` attribútumokkal.
 */
export function Field({ id, label, optional, hint, error, children, className }: FieldProps) {
  return (
    <div className={`hvh-field ${className ?? ""}`}>
      <label className="hvh-label" htmlFor={id}>
        {label}
        {optional ? <span className="hvh-label__optional"> (opcionális)</span> : null}
      </label>
      {hint ? (
        <p className="hvh-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="hvh-error" id={`${id}-error`}>
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
