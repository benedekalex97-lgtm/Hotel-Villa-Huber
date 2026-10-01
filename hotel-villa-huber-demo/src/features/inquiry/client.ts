import type { InquiryErrors, InquiryInput } from "./schema";

export type SubmitResult =
  | { status: "accepted" }
  | { status: "not_configured" }
  | { status: "invalid"; errors: InquiryErrors }
  | { status: "rate_limited" }
  | { status: "failed" };

/** Az ajánlatkérő elküldése a szerveroldali végpontra. Hálózati hibánál „failed”. */
export async function submitInquiry(input: InquiryInput, meta: { startedAt: number; website: string }): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/ajanlatkeres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, startedAt: meta.startedAt, website: meta.website }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await response.json().catch(() => null)) as { status?: string; errors?: InquiryErrors } | null;
    switch (data?.status) {
      case "accepted":
        return response.ok ? { status: "accepted" } : { status: "failed" };
      case "not_configured":
        return { status: "not_configured" };
      case "invalid":
        return { status: "invalid", errors: data.errors ?? {} };
      case "rate_limited":
        return { status: "rate_limited" };
      default:
        return { status: "failed" };
    }
  } catch {
    return { status: "failed" };
  }
}
