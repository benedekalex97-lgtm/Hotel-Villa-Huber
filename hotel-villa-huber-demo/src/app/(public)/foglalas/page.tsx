import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingPage } from "@/features/booking/BookingPage";

export const metadata: Metadata = {
  title: "Foglalás — bemutató",
  description: "Bemutató foglalási folyamat a Hotel Villa Huberhez. Valódi foglalás nem történik.",
};

export default function Page() {
  // A foglalási folyamat a keresési paramétereket (érkezés, távozás, vendégek) a kliensen olvassa.
  return (
    <Suspense>
      <BookingPage />
    </Suspense>
  );
}
