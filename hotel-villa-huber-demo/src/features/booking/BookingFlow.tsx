"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useRef, type FormEvent } from "react";
import { ROUTES } from "@/content/site";
import { DemoNotice, SampleBadge } from "./DemoNotice";
import { CountFields, DateFields, fieldId, focusField } from "./fields";
import { flowReducer, initFlowState, type StepId } from "./flow-state";
import { GUEST_FIELD_IDS, GuestFormFields } from "./GuestForm";
import {
  firstErrorKey,
  formatGuestsHu,
  formatNightsHu,
  formatPeriodHu,
  GUEST_FIELD_ORDER,
  nightsBetween,
  QUERY_FIELD_ORDER,
  todayIso,
  validateGuest,
  validateQuery,
  type QueryErrors,
} from "./model";
import { OfferList } from "./OfferList";
import { getBookingProvider } from "./provider-registry";
import { Stepper } from "./Stepper";
import { SummaryList } from "./SummaryList";
import { useToday } from "./useToday";
import styles from "./BookingFlow.module.css";

const PREFIX = "flow";
const DATE_KEYS = ["arrival", "departure"] as const;

function pickErrors(errors: QueryErrors, keys: readonly (keyof QueryErrors)[]): QueryErrors {
  const picked: QueryErrors = {};
  for (const key of keys) if (errors[key]) picked[key] = errors[key];
  return picked;
}

/**
 * A teljes demó foglalási folyamat. Egyetlen reducer-állapot tartja az összes adatot,
 * ezért a visszalépés mindent megőriz. A vendégadat kizárólag ebben a React-állapotban él:
 * nincs hálózati hívás, tárolás, süti és az URL-be sem kerül.
 */
export function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useToday();
  const [state, dispatch] = useReducer(flowReducer, undefined, () => initFlowState(searchParams, todayIso()));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<StepId>(state.step);

  // Lépésváltáskor a fókusz az új lépés címére kerül (képernyőolvasóknak és billentyűzetnek).
  useEffect(() => {
    if (previousStep.current !== state.step) {
      previousStep.current = state.step;
      headingRef.current?.focus();
    }
  }, [state.step]);

  // Elérhetőség keresése a szolgáltatótól; az elavult válaszokat a `cancelled` és a `run` számláló eldobja.
  const { status: searchStatus, query: searchQuery, run: searchRun } = state.search;
  useEffect(() => {
    if (searchStatus !== "loading" || !searchQuery) return;
    let cancelled = false;
    getBookingProvider()
      .searchAvailability(searchQuery)
      .then((offers) => {
        if (!cancelled) dispatch({ type: "searchDone", run: searchRun, offers });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "searchFailed", run: searchRun });
      });
    return () => {
      cancelled = true;
    };
  }, [searchStatus, searchQuery, searchRun]);

  const { query, guest, step } = state;
  const offers = state.search.offers;
  const selectedOffer = offers.find((offer) => offer.id === state.offerId) ?? null;
  const goTo = (target: StepId) => dispatch({ type: "goto", step: target });

  function submitDates(event: FormEvent) {
    event.preventDefault();
    const errors = pickErrors(validateQuery(query, todayIso()), DATE_KEYS);
    dispatch({ type: "queryErrors", errors });
    const first = firstErrorKey(errors, QUERY_FIELD_ORDER);
    if (first) focusField(fieldId(PREFIX, first));
    else goTo(2);
  }

  function submitGuests(event: FormEvent) {
    event.preventDefault();
    const errors = validateQuery(query, todayIso());
    const first = firstErrorKey(errors, QUERY_FIELD_ORDER);
    if (first) {
      dispatch({ type: "queryErrors", errors });
      if (first === "arrival" || first === "departure") goTo(1);
      focusField(fieldId(PREFIX, first));
      return;
    }
    dispatch({ type: "queryErrors", errors: {} });
    dispatch({ type: "search" });
  }

  function submitGuest(event: FormEvent) {
    event.preventDefault();
    const errors = validateGuest(guest);
    dispatch({ type: "guestErrors", errors });
    const first = firstErrorKey(errors, GUEST_FIELD_ORDER);
    if (first) focusField(GUEST_FIELD_IDS[first]);
    else goTo(5);
  }

  function restart() {
    dispatch({ type: "reset" });
    router.replace(ROUTES.booking, { scroll: false });
  }

  const nights = nightsBetween(query.arrival, query.departure);
  const showAside = step <= 4;

  return (
    <div className={styles.flow}>
      {step <= 5 ? <Stepper current={step as 1 | 2 | 3 | 4 | 5} onGo={goTo} /> : null}

      <div className={showAside ? styles.layout : styles.layoutSingle}>
        <section className={styles.panel} aria-labelledby="flow-heading">
          {step === 1 ? (
            <form noValidate onSubmit={submitDates} className={styles.stepForm}>
              <h2 id="flow-heading" ref={headingRef} tabIndex={-1}>
                Mikor érkezik?
              </h2>
              <p className={styles.stepLead}>Válassza ki az érkezés és a távozás napját.</p>
              <div className={styles.twoCols}>
                <DateFields
                  prefix={PREFIX}
                  query={query}
                  errors={state.queryErrors}
                  today={today}
                  onChange={(patch) => dispatch({ type: "query", patch })}
                />
              </div>
              {nights > 0 ? (
                <p className={styles.live} role="status">
                  {formatNightsHu(nights)}
                </p>
              ) : null}
              <div className={styles.actions}>
                <button type="submit" className="hvh-btn">
                  Tovább a vendégekhez
                </button>
              </div>
            </form>
          ) : null}

          {step === 2 ? (
            <form noValidate onSubmit={submitGuests} className={styles.stepForm}>
              <h2 id="flow-heading" ref={headingRef} tabIndex={-1}>
                Hányan érkeznek?
              </h2>
              <p className={styles.stepLead}>Szobánként legalább egy felnőtt szükséges.</p>
              <div className={styles.countGrid}>
                <CountFields
                  prefix={PREFIX}
                  query={query}
                  errors={state.queryErrors}
                  onChange={(patch) => dispatch({ type: "query", patch })}
                />
              </div>
              <div className={styles.actions}>
                <button type="button" className="hvh-btn hvh-btn--secondary" onClick={() => goTo(1)}>
                  Vissza
                </button>
                <button type="submit" className="hvh-btn">
                  Elérhetőség megtekintése
                </button>
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <div className={styles.stepForm}>
              <h2 id="flow-heading" ref={headingRef} tabIndex={-1}>
                Elérhetőség és elhelyezés
              </h2>
              {state.search.query ? (
                <p className={styles.stepLead}>
                  {formatPeriodHu(state.search.query.arrival, state.search.query.departure)} ·{" "}
                  {formatNightsHu(nightsBetween(state.search.query.arrival, state.search.query.departure))} ·{" "}
                  {formatGuestsHu(state.search.query.adults, state.search.query.children)} · {state.search.query.rooms} szoba
                </p>
              ) : null}

              {state.search.status === "loading" ? (
                <div className={styles.loading} role="status" aria-live="polite">
                  <span className={styles.spinner} aria-hidden="true" />
                  <span>Elérhetőség keresése…</span>
                </div>
              ) : null}

              {state.search.status === "error" ? (
                <div className="hvh-notice hvh-notice--danger" role="alert">
                  <strong>Az elérhetőség lekérdezése nem sikerült.</strong>
                  <span>Próbálja újra néhány másodperc múlva.</span>
                </div>
              ) : null}

              {state.search.status === "ready" ? (
                <>
                  <p className={styles.sampleLine}>
                    <SampleBadge />
                    <span>Az alábbi lista mintaadat, nem a hotel valós szabad szobakészlete.</span>
                  </p>
                  {offers.length > 0 ? (
                    <OfferList offers={offers} selectedId={state.offerId} onSelect={(id) => dispatch({ type: "selectOffer", id })} />
                  ) : (
                    <div className="hvh-notice" role="status">
                      <strong>Ehhez a létszámhoz nincs minta-elhelyezés.</strong>
                      <span>Próbáljon több szobát megadni, vagy módosítsa a vendégek számát.</span>
                    </div>
                  )}
                </>
              ) : null}

              <div className={styles.actions}>
                <button type="button" className="hvh-btn hvh-btn--secondary" onClick={() => goTo(2)}>
                  Vissza a vendégekhez
                </button>
                {state.search.status === "error" ? (
                  <button type="button" className="hvh-btn" onClick={() => dispatch({ type: "search" })}>
                    Újrapróbálom
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <form noValidate onSubmit={submitGuest} className={styles.stepForm}>
              <h2 id="flow-heading" ref={headingRef} tabIndex={-1}>
                Vendégadatok
              </h2>
              <p className={styles.stepLead}>
                A megadott adatokat nem küldjük el és nem mentjük: csak az összesítőben jelennek meg, és a lap bezárásakor elvesznek.
              </p>
              <GuestFormFields guest={guest} errors={state.guestErrors} onChange={(patch) => dispatch({ type: "guest", patch })} />
              <div className={styles.actions}>
                <button type="button" className="hvh-btn hvh-btn--secondary" onClick={() => goTo(3)}>
                  Vissza
                </button>
                <button type="submit" className="hvh-btn">
                  Tovább az összesítőhöz
                </button>
              </div>
            </form>
          ) : null}

          {step === 5 ? (
            <div className={styles.stepForm}>
              <h2 id="flow-heading" ref={headingRef} tabIndex={-1}>
                Összesítő
              </h2>
              <DemoNotice />
              <SummaryList query={query} offer={selectedOffer} guest={guest} onEdit={goTo} />
              <p className={styles.stepLead}>A „Demó befejezése” gomb nem hoz létre foglalást, és semmit nem küld el.</p>
              <div className={styles.actions}>
                <button type="button" className="hvh-btn hvh-btn--secondary" onClick={() => goTo(4)}>
                  Vissza
                </button>
                <button type="button" className="hvh-btn" onClick={() => goTo(6)}>
                  Demó befejezése
                </button>
              </div>
            </div>
          ) : null}

          {step === 6 ? (
            <div className={styles.stepForm}>
              <h2 id="flow-heading" ref={headingRef} tabIndex={-1}>
                A bemutató véget ért — foglalás nem történt
              </h2>
              <DemoNotice />
              <ul className={styles.facts}>
                <li>Nem történt foglalás.</li>
                <li>Semmit nem küldtünk el: sem a szállodának, sem Önnek.</li>
                <li>Nem készült visszaigazolás, és foglalási szám sincs.</li>
                <li>A megadott adatokat nem mentettük; a lap bezárásakor elvesznek.</li>
              </ul>
              <h3 className={styles.subhead}>A bemutatóban megadott adatok</h3>
              <SummaryList query={query} offer={selectedOffer} guest={guest} />
              <div className={styles.actions}>
                <button type="button" className="hvh-btn" onClick={restart}>
                  Új keresés
                </button>
                <Link href={ROUTES.home} className="hvh-btn hvh-btn--secondary">
                  Vissza a nyitóoldalra
                </Link>
              </div>
            </div>
          ) : null}
        </section>

        {showAside ? (
          <aside className={`${styles.aside} ${step <= 2 ? styles.asideEarly : ""}`} aria-labelledby="flow-aside-title">
            <h2 id="flow-aside-title" className={styles.asideTitle}>
              Az Ön választása
            </h2>
            <SummaryList query={query} offer={selectedOffer} hideEmpty />
            <p className={styles.asideNote}>Bemutató folyamat — az adatok nem kerülnek elküldésre.</p>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
