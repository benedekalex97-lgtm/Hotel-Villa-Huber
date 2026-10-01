import type { Metadata } from "next";
import { HomePage } from "@/features/home/HomePage";
import { PROPERTY } from "@/content/property";

export const metadata: Metadata = {
  title: { absolute: `${PROPERTY.name} — ${PROPERTY.tagline.replace(/\.$/, "")}` },
};

export default function Page() {
  return <HomePage />;
}
