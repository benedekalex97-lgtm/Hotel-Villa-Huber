import { DEFAULT_SITE_URL } from "@/content/site-url";
import { composeEmail } from "@/features/email/compose";
import { initialDraftState, type DraftState } from "@/features/email/draft";
import { EMPTY_PERSONAL, type PersonalValues } from "@/features/email/model";

/** Egyértelműen fiktív minta-személyes adatok (nem valódi címzett vagy feladó). */
export const SAMPLE_PERSONAL: PersonalValues = {
  ...EMPTY_PERSONAL,
  recipientName: "Minta Címzett",
  senderName: "Minta Feladó",
  senderPhone: "+36 1 000 0000",
};

export function stateWith(personal: Partial<PersonalValues> = {}, patch: Partial<DraftState> = {}): DraftState {
  return { ...initialDraftState(), personal: { ...SAMPLE_PERSONAL, ...personal }, ...patch };
}

export function compose(personal: Partial<PersonalValues> = {}, patch: Partial<DraftState> = {}, baseUrl = DEFAULT_SITE_URL) {
  return composeEmail(stateWith(personal, patch), baseUrl);
}

/** Összehasonlításhoz: kisbetű, összevont szóközök. */
export function norm(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/** HTML → sima szöveg (címkék nélkül, entitások visszaalakítva). */
export function htmlToText(html: string): string {
  return html
    .replace(/<head>[\s\S]*?<\/head>/, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&zwnj;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}
