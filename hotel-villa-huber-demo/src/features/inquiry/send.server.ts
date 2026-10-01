import "server-only";
import type { InquiryInput } from "./schema";
import { composeInquiryEmail } from "./schema";
import { providerConfig, type DeliveryEnv } from "./delivery";

export type SendResult =
  | { status: "accepted" }
  | { status: "not_configured" }
  | { status: "failed" };

/**
 * Továbbítás a konfigurált providernek. „accepted” csak akkor, ha a provider
 * 2xx választ adott — ez a provider általi átvétel, nem igazolt postafiók-kézbesítés.
 * Személyes adatot nem naplózunk.
 */
export async function sendInquiry(input: InquiryInput, env: DeliveryEnv = process.env, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  const config = providerConfig(env);
  if (!config) return { status: "not_configured" };
  const mail = composeInquiryEmail(input);

  try {
    let response: Response;
    if (config.provider === "resend") {
      response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: config.from, to: [mail.to], reply_to: input.email, subject: mail.subject, text: mail.text }),
        signal: AbortSignal.timeout(10_000),
      });
    } else {
      response = await fetchImpl(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.secret ? { Authorization: `Bearer ${config.secret}` } : {}),
        },
        body: JSON.stringify({ to: mail.to, replyTo: input.email, subject: mail.subject, text: mail.text, fields: input }),
        signal: AbortSignal.timeout(10_000),
      });
    }
    return response.ok ? { status: "accepted" } : { status: "failed" };
  } catch {
    return { status: "failed" };
  }
}
