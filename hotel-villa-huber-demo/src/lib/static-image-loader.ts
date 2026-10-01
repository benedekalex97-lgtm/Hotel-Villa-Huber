/**
 * Statikus exporthoz (GitHub Pages) használt next/image loader:
 * nincs szerveres képoptimalizálás, a public/ alatti képet a basePath-szal adjuk vissza.
 * A forrásképek legfeljebb 1024 px szélesek, ezért a szélesség-paramétert figyelmen kívül hagyjuk.
 */
export default function staticImageLoader({ src }: { src: string; width: number; quality?: number }): string {
  if (/^https?:\/\//.test(src)) return src;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}
