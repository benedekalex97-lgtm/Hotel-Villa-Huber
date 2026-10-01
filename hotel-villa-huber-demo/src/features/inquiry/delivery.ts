/**
 * Ajánlatkérő kézbesítési módja — a környezeti változókból.
 *
 * - "server": szerveroldali továbbítás konfigurálva (Resend API vagy webhook);
 * - "mailto": nincs backend — a form levelet készít elő a felhasználó levelezőjében.
 *
 * A kulcsok csak szerveren olvashatók (nincs NEXT_PUBLIC_ előtag), a kliensbe nem kerülnek.
 */
export type DeliveryMode = "server" | "mailto";

/** Releváns kulcsok: INQUIRY_PROVIDER, RESEND_API_KEY, INQUIRY_FROM_EMAIL, INQUIRY_WEBHOOK_URL, INQUIRY_WEBHOOK_SECRET. */
export type DeliveryEnv = Record<string, string | undefined>;

export type ProviderConfig =
  | { provider: "resend"; apiKey: string; from: string }
  | { provider: "webhook"; url: string; secret: string | null }
  | null;

export function providerConfig(env: DeliveryEnv = process.env): ProviderConfig {
  const provider = env.INQUIRY_PROVIDER?.trim();
  if (provider === "resend" && env.RESEND_API_KEY?.trim() && env.INQUIRY_FROM_EMAIL?.trim()) {
    return { provider: "resend", apiKey: env.RESEND_API_KEY.trim(), from: env.INQUIRY_FROM_EMAIL.trim() };
  }
  if (provider === "webhook" && env.INQUIRY_WEBHOOK_URL?.trim().startsWith("https://")) {
    return { provider: "webhook", url: env.INQUIRY_WEBHOOK_URL.trim(), secret: env.INQUIRY_WEBHOOK_SECRET?.trim() || null };
  }
  return null;
}

export function deliveryMode(env: DeliveryEnv = process.env): DeliveryMode {
  return providerConfig(env) ? "server" : "mailto";
}
