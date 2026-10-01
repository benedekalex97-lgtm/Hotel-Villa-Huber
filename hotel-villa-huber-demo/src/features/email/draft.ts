import { renderTemplate } from "./render";
import {
  DEFAULT_TEMPLATE_ID,
  demoValuesFor,
  EMPTY_VALUES,
  TEMPLATES,
  getTemplate,
  type TemplateId,
  type Values,
  type VarName,
} from "./templates";

/**
 * Vázlatállapot sablononként (csak a böngészőfül memóriájában).
 *
 * A mezők értékei közösek; a tárgy és a szöveg sablononként külön vázlat.
 * `*Edited`: a vázlat kézzel módosult az utolsó automatikus megjelenítéshez képest.
 * `*Skipped`: mezőváltozás történt, de a kézi szöveget nem írtuk felül (értesítés jár).
 */

export type TextField = "subject" | "body";

export interface Draft {
  subject: string;
  body: string;
  subjectEdited: boolean;
  bodyEdited: boolean;
  subjectSkipped: boolean;
  bodySkipped: boolean;
}

export interface DraftState {
  active: TemplateId;
  values: Values;
  drafts: Record<TemplateId, Draft>;
  /** Igaz, amíg a mezők a fiktív mintaadatokat tartalmazzák (módosítatlanul). */
  demo: boolean;
}

export type DraftAction =
  | { type: "select"; id: TemplateId }
  | { type: "setValue"; name: VarName; value: string }
  | { type: "fillDemo" }
  | { type: "clearValues" }
  | { type: "edit"; field: TextField; text: string }
  | { type: "refresh"; field: TextField }
  | { type: "keep"; field: TextField }
  | { type: "reset" };

function freshDraft(id: TemplateId, values: Values): Draft {
  const { subject, body } = renderTemplate(getTemplate(id), values);
  return { subject, body, subjectEdited: false, bodyEdited: false, subjectSkipped: false, bodySkipped: false };
}

export function initialDraftState(): DraftState {
  const drafts = {} as Record<TemplateId, Draft>;
  for (const t of TEMPLATES) drafts[t.id] = freshDraft(t.id, EMPTY_VALUES);
  return { active: DEFAULT_TEMPLATE_ID, values: EMPTY_VALUES, drafts, demo: false };
}

/** Egy mező frissítése új mezőértékek mellett: kézi szöveget soha nem ír felül. */
function updateField(
  text: string,
  edited: boolean,
  skipped: boolean,
  prevRendered: string,
  nextRendered: string,
): { text: string; edited: boolean; skipped: boolean } {
  if (!edited) return { text: nextRendered, edited: false, skipped: false };
  // A kézi szöveg véletlenül egyezik az új automatikus szöveggel: már nem „kézi”.
  if (text === nextRendered) return { text, edited: false, skipped: false };
  return { text, edited: true, skipped: skipped || prevRendered !== nextRendered };
}

function applyValues(state: DraftState, values: Values): Record<TemplateId, Draft> {
  const drafts = {} as Record<TemplateId, Draft>;
  for (const t of TEMPLATES) {
    const d = state.drafts[t.id];
    const prev = renderTemplate(t, state.values);
    const next = renderTemplate(t, values);
    const s = updateField(d.subject, d.subjectEdited, d.subjectSkipped, prev.subject, next.subject);
    const b = updateField(d.body, d.bodyEdited, d.bodySkipped, prev.body, next.body);
    drafts[t.id] = {
      subject: s.text,
      body: b.text,
      subjectEdited: s.edited,
      bodyEdited: b.edited,
      subjectSkipped: s.skipped,
      bodySkipped: b.skipped,
    };
  }
  return drafts;
}

function patchActive(state: DraftState, patch: Partial<Draft>): DraftState {
  return { ...state, drafts: { ...state.drafts, [state.active]: { ...state.drafts[state.active], ...patch } } };
}

export function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "select":
      return { ...state, active: action.id };

    case "setValue": {
      if (state.values[action.name] === action.value) return state;
      const values = { ...state.values, [action.name]: action.value };
      return { ...state, values, drafts: applyValues(state, values), demo: false };
    }

    case "fillDemo": {
      const values = demoValuesFor(state.active);
      return { ...state, values, drafts: applyValues(state, values), demo: true };
    }

    case "clearValues":
      return { ...state, values: EMPTY_VALUES, drafts: applyValues(state, EMPTY_VALUES), demo: false };

    case "edit": {
      const rendered = renderTemplate(getTemplate(state.active), state.values)[action.field];
      const edited = action.text !== rendered;
      const d = state.drafts[state.active];
      if (action.field === "subject") {
        return patchActive(state, { subject: action.text, subjectEdited: edited, subjectSkipped: edited && d.subjectSkipped });
      }
      return patchActive(state, { body: action.text, bodyEdited: edited, bodySkipped: edited && d.bodySkipped });
    }

    case "refresh": {
      const rendered = renderTemplate(getTemplate(state.active), state.values)[action.field];
      return action.field === "subject"
        ? patchActive(state, { subject: rendered, subjectEdited: false, subjectSkipped: false })
        : patchActive(state, { body: rendered, bodyEdited: false, bodySkipped: false });
    }

    case "keep":
      return action.field === "subject" ? patchActive(state, { subjectSkipped: false }) : patchActive(state, { bodySkipped: false });

    case "reset":
      return { ...state, drafts: { ...state.drafts, [state.active]: freshDraft(state.active, state.values) } };
  }
}
