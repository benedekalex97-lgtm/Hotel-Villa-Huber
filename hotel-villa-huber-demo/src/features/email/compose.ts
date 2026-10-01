import { countStatuses } from "./document-text";
import type { DraftState } from "./draft";
import type { EditableField, EmailDocument } from "./model";
import { buildDocument } from "./presentation";
import { renderHtml } from "./render-html";
import { renderText } from "./render-text";
import { computeReadiness, type Readiness } from "./validate";

export interface ComposedEmail {
  doc: EmailDocument;
  fields: EditableField[];
  subject: string;
  html: string;
  text: string;
  readiness: Readiness;
}

/**
 * A levél összeállítása a vázlatból: dokumentum → HTML + plain text + készenléti ellenőrzés.
 * Az előnézet és az export ugyanezt a `html` és `text` értéket használja.
 */
export function composeEmail(state: DraftState, baseUrl: string): ComposedEmail {
  const { doc, fields } = buildDocument({
    personal: state.personal,
    subject: state.subject,
    preheader: state.preheader,
    overrides: state.overrides,
    baseUrl,
  });
  const counts = countStatuses(doc);
  return {
    doc,
    fields,
    subject: doc.subject,
    html: renderHtml(doc),
    text: renderText(doc),
    readiness: computeReadiness(doc, state.personal, counts),
  };
}
