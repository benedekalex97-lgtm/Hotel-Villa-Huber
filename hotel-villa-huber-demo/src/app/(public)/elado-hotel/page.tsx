import type { Metadata } from "next";
import { SalePage } from "@/features/sale/SalePage";
import { PROPERTY } from "@/content/property";
import { deliveryMode } from "@/features/inquiry/delivery";

export const metadata: Metadata = {
  title: "Tulajdonos lennél?",
  description: `${PROPERTY.name} — vásárlási lehetőség Karintiában, magyar befektetőknek és szállodás vállalkozásoknak.`,
};

export default function Page() {
  // A kézbesítési mód a szerveren dől el (env); kulcs nem kerül a kliensbe, csak a mód.
  return <SalePage deliveryMode={deliveryMode()} />;
}
