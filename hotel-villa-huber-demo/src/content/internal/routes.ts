/** Belső útvonalak — csak a /munka/* fájlok importálhatják (publikus bundle-be nem kerülhet). */
export const INTERNAL_ROUTES = {
  email: "/munka/email",
  brand: "/munka/brand",
} as const;
