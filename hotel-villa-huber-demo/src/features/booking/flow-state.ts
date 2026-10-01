import {
  DEFAULT_QUERY,
  EMPTY_GUEST,
  queryFromParams,
  queryKey,
  validateQuery,
  type BookingQuery,
  type GuestDetails,
  type GuestErrors,
  type Offer,
  type QueryErrors,
} from "./model";

/** 1 Időpont · 2 Vendégek · 3 Elérhetőség és elhelyezés · 4 Vendégadatok · 5 Összesítő · 6 Lezárás (a demó vége). */
export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export const STEPS: readonly { id: Exclude<StepId, 6>; label: string }[] = [
  { id: 1, label: "Időpont" },
  { id: 2, label: "Vendégek" },
  { id: 3, label: "Elérhetőség és elhelyezés" },
  { id: 4, label: "Vendégadatok" },
  { id: 5, label: "Összesítő" },
];

export interface SearchState {
  status: "idle" | "loading" | "ready" | "error";
  /** A keresés indításakori feltételek (pillanatkép). */
  query: BookingQuery | null;
  offers: Offer[];
  /** Növekvő számláló: elavult válaszok eldobásához és az effect újraindításához. */
  run: number;
}

export interface FlowState {
  step: StepId;
  query: BookingQuery;
  queryErrors: QueryErrors;
  search: SearchState;
  offerId: string | null;
  guest: GuestDetails;
  guestErrors: GuestErrors;
}

export type FlowAction =
  | { type: "query"; patch: Partial<BookingQuery> }
  | { type: "queryErrors"; errors: QueryErrors }
  | { type: "goto"; step: StepId }
  | { type: "search" }
  | { type: "searchDone"; run: number; offers: Offer[] }
  | { type: "searchFailed"; run: number }
  | { type: "selectOffer"; id: string }
  | { type: "guest"; patch: Partial<GuestDetails> }
  | { type: "guestErrors"; errors: GuestErrors }
  | { type: "reset" };

const IDLE_SEARCH: SearchState = { status: "idle", query: null, offers: [], run: 0 };

/**
 * Kezdőállapot az URL-paraméterekből. Érvényes feltételnél a keresés azonnal indul (3. lépés),
 * hibás vagy hiányos feltételnél a megfelelő lépésen indulunk, a kitöltött értékekkel.
 */
export function initFlowState(params: { get(key: string): string | null }, today: string): FlowState {
  const query = queryFromParams((key) => params.get(key));
  const base: FlowState = {
    step: 1,
    query,
    queryErrors: {},
    search: IDLE_SEARCH,
    offerId: null,
    guest: EMPTY_GUEST,
    guestErrors: {},
  };
  if (!query.arrival && !query.departure) return base;

  const errors = validateQuery(query, today);
  if (Object.keys(errors).length === 0) {
    return { ...base, step: 3, search: { status: "loading", query, offers: [], run: 1 } };
  }
  const dateError = Boolean(errors.arrival || errors.departure);
  return { ...base, step: dateError ? 1 : 2, queryErrors: errors };
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "query": {
      const queryErrors = { ...state.queryErrors };
      for (const key of Object.keys(action.patch) as (keyof BookingQuery)[]) delete queryErrors[key];
      // A felnőttek száma módosítja a „szobák ≤ felnőttek” szabályt, ezért a szobák hibája is törlődik.
      if ("adults" in action.patch) delete queryErrors.rooms;
      return { ...state, query: { ...state.query, ...action.patch }, queryErrors };
    }
    case "queryErrors":
      return { ...state, queryErrors: action.errors };
    case "goto":
      return { ...state, step: action.step };
    case "search": {
      const { search } = state;
      const sameQuery = search.query !== null && queryKey(search.query) === queryKey(state.query);
      if (sameQuery && (search.status === "ready" || search.status === "loading")) return { ...state, step: 3 };
      return { ...state, step: 3, search: { status: "loading", query: { ...state.query }, offers: [], run: search.run + 1 } };
    }
    case "searchDone": {
      if (action.run !== state.search.run) return state;
      const stillOffered = action.offers.some((offer) => offer.id === state.offerId);
      return {
        ...state,
        search: { ...state.search, status: "ready", offers: action.offers },
        offerId: stillOffered ? state.offerId : null,
      };
    }
    case "searchFailed":
      if (action.run !== state.search.run) return state;
      return { ...state, search: { ...state.search, status: "error", offers: [] } };
    case "selectOffer":
      return { ...state, offerId: action.id, step: 4 };
    case "guest": {
      const guestErrors = { ...state.guestErrors };
      for (const key of Object.keys(action.patch) as (keyof GuestDetails)[]) delete guestErrors[key];
      return { ...state, guest: { ...state.guest, ...action.patch }, guestErrors };
    }
    case "guestErrors":
      return { ...state, guestErrors: action.errors };
    case "reset":
      return {
        step: 1,
        query: DEFAULT_QUERY,
        queryErrors: {},
        search: { ...IDLE_SEARCH, run: state.search.run + 1 },
        offerId: null,
        guest: EMPTY_GUEST,
        guestErrors: {},
      };
  }
}
