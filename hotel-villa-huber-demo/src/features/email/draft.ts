import { EMPTY_PERSONAL, type PersonalField, type PersonalValues } from "./model";
import { DEFAULT_PREHEADER, DEFAULT_SUBJECT } from "./presentation";

/**
 * Vázlatállapot — kizárólag a böngészőfül memóriájában (React-állapot).
 * A személyes mezők, a tárgy, az előnézeti szöveg és a szekciószövegek egymástól függetlenek:
 * egyik változtatása (név, telefonszám, előnézeti méret) sem írja felül a kézi szerkesztést.
 */
export interface DraftState {
  personal: PersonalValues;
  subject: string;
  preheader: string;
  /** Kézi szekciószöveg-módosítások mezőkulcs szerint; csak az alapértéktől eltérő érték él itt. */
  overrides: Record<string, string>;
}

export type DraftAction =
  | { type: "setPersonal"; field: PersonalField; value: string }
  | { type: "setSubject"; value: string }
  | { type: "setPreheader"; value: string }
  | { type: "setOverride"; key: string; value: string; base: string }
  | { type: "clearOverride"; key: string }
  | { type: "resetContent" };

export function initialDraftState(): DraftState {
  return { personal: { ...EMPTY_PERSONAL }, subject: DEFAULT_SUBJECT, preheader: DEFAULT_PREHEADER, overrides: {} };
}

export function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "setPersonal":
      if (state.personal[action.field] === action.value) return state;
      return { ...state, personal: { ...state.personal, [action.field]: action.value } };
    case "setSubject":
      return { ...state, subject: action.value };
    case "setPreheader":
      return { ...state, preheader: action.value };
    case "setOverride": {
      const overrides = { ...state.overrides };
      if (action.value === action.base) delete overrides[action.key];
      else overrides[action.key] = action.value;
      return { ...state, overrides };
    }
    case "clearOverride": {
      if (!(action.key in state.overrides)) return state;
      const overrides = { ...state.overrides };
      delete overrides[action.key];
      return { ...state, overrides };
    }
    case "resetContent":
      // A központi alapváltozatra áll vissza a tartalom; a címzett és a feladó adatai megmaradnak.
      return { ...state, subject: DEFAULT_SUBJECT, preheader: DEFAULT_PREHEADER, overrides: {} };
  }
}

/** Hány kézi tartalmi módosítás van (tárgy, előnézeti szöveg, szekciószövegek). */
export function countManualEdits(state: DraftState): number {
  return (state.subject !== DEFAULT_SUBJECT ? 1 : 0) + (state.preheader !== DEFAULT_PREHEADER ? 1 : 0) + Object.keys(state.overrides).length;
}
