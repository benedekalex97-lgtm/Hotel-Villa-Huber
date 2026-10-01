import type { Metadata } from "next";
import { SalePage } from "@/features/sale/SalePage";
import { PROPERTY } from "@/content/property";

export const metadata: Metadata = {
  title: "Eladó hotel",
  description: `${PROPERTY.name} — vásárlási lehetőség Karintiában, magyar befektetőknek és szállodás vállalkozásoknak.`,
};

export default function Page() {
  return <SalePage />;
}
