/**
 * BELSŐ — tulajdonosi tárgyalási háttér.
 * Ezt a modult publikus oldal nem importálhatja (a verify:public ellenőrzi,
 * hogy az értékek nem kerülnek a publikus build kimenetébe).
 * Ajánlati tervezet, nem elfogadott szerződés.
 */
export const COMMERCIAL_DRAFT = {
  status: "ajánlati tervezet — nem elfogadott szerződés",
  source: "SRC-KOLTSEGTERV-V0.2",
  onboardingFeeHuf: 250_000,
  monthlyFeeHuf: 150_000,
  successFeePercent: 2,
  notes: [
    "Nettó összegek.",
    "A javasolt sikerdíjba a munkadíjak beszámítanak.",
    "Az első 90 nap az értékesítési munka első időszaka, nem garantált eladási határidő.",
  ],
} as const;
