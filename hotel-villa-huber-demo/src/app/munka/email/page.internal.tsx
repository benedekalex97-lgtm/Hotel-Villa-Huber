import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { internalToolsEnabled } from "@/lib/internal-gate";
import { EmailWorkbench } from "@/features/email/EmailWorkbench";

export const metadata: Metadata = {
  title: "Emailsablonok",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function Page() {
  if (!internalToolsEnabled()) notFound();
  return <EmailWorkbench />;
}
