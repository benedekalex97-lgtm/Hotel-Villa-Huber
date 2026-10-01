/**
 * Másolás és letöltés a böngészőben. Siker csak tényleges sikeres művelet után jelezhető;
 * hibánál valós, magyarázó üzenet jár, és a hívó letöltési vagy kézi másolási alternatívát kínál.
 */

export type ClipboardResult = { ok: true } | { ok: false; message: string };

export const EXPORT_FILES = {
  html: { name: "hotel-villa-huber-bemutato.html", mime: "text/html;charset=utf-8" },
  text: { name: "hotel-villa-huber-bemutato.txt", mime: "text/plain;charset=utf-8" },
} as const;

function failureMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "A böngésző elutasította a vágólap-hozzáférést (engedély hiányzik, vagy a lap nincs előtérben).";
  }
  if (name === "NotSupportedError") return "A böngésző nem támogatja ezt a vágólap-formátumot.";
  const detail = error instanceof Error && error.message ? ` (${error.message})` : "";
  return `A vágólapra másolás nem sikerült${detail}.`;
}

const UNSUPPORTED = "A böngésző nem támogatja a vágólapra másolást ezen a címen vagy ebben a környezetben.";

function withTextarea(text: string, run: () => boolean): boolean {
  if (typeof document === "undefined" || !document.body) return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  const selection = document.getSelection();
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  area.select();
  let ok = false;
  try {
    ok = run();
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  if (previous && selection) {
    selection.removeAllRanges();
    selection.addRange(previous);
  }
  return ok;
}

function legacyText(text: string): boolean {
  return withTextarea(text, () => document.execCommand("copy"));
}

/** Régi böngészők: a `copy` eseményben állítjuk be a text/html és text/plain reprezentációt. */
function legacyRich(html: string, text: string): boolean {
  let handled = false;
  const handler = (event: ClipboardEvent) => {
    if (!event.clipboardData) return;
    event.preventDefault();
    event.clipboardData.setData("text/html", html);
    event.clipboardData.setData("text/plain", text);
    handled = true;
  };
  document.addEventListener("copy", handler);
  try {
    const ok = withTextarea(text, () => document.execCommand("copy"));
    return ok && handled;
  } finally {
    document.removeEventListener("copy", handler);
  }
}

export async function copyText(text: string): Promise<ClipboardResult> {
  let failure: string | null = null;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch (error) {
      failure = failureMessage(error);
    }
  }
  if (legacyText(text)) return { ok: true };
  return { ok: false, message: failure ?? UNSUPPORTED };
}

/** Formázott levél: text/html és text/plain reprezentáció együtt, ahol a böngésző támogatja. */
export async function copyRichText(html: string, text: string): Promise<ClipboardResult> {
  let failure: string | null = null;
  const canWrite = typeof navigator !== "undefined" && !!navigator.clipboard?.write && typeof ClipboardItem !== "undefined";
  if (canWrite) {
    try {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
      return { ok: true };
    } catch (error) {
      failure = failureMessage(error);
    }
  }
  if (typeof document !== "undefined" && legacyRich(html, text)) return { ok: true };
  return { ok: false, message: failure ?? "A böngésző nem támogatja a formázott (HTML) vágólapra másolást." };
}

/** UTF-8 fájl letöltése. Személyes tartalom nem kerül szerverre: a fájl a böngészőben készül. */
export function downloadFile(kind: keyof typeof EXPORT_FILES, content: string): boolean {
  if (typeof document === "undefined") return false;
  const { name, mime } = EXPORT_FILES[kind];
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}
