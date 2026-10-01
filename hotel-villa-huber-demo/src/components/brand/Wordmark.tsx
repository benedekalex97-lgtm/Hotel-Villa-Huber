import { WORDMARK_HOTEL_PATH, WORDMARK_NAME_PATH, WORDMARK_VIEWBOX, WORDMARK_WIDTH, WORDMARK_HEIGHT } from "./wordmark-paths";

interface WordmarkProps {
  /** Megjelenített szélesség pixelben; a magasság arányosan számolódik. */
  width?: number;
  tone?: "forest" | "ink" | "light";
  className?: string;
  /** Ha a környezet már kiírja a nevet (pl. link címkéje), dekoratív. */
  decorative?: boolean;
}

const TONES = {
  forest: { main: "var(--hvh-forest)", accent: "var(--hvh-bronze)" },
  ink: { main: "var(--hvh-ink)", accent: "var(--hvh-bronze)" },
  light: { main: "var(--hvh-on-dark)", accent: "#d9b98f" },
} as const;

/** Ideiglenes Hotel Villa Huber wordmark (nem hivatalos logó). */
export function Wordmark({ width = 168, tone = "forest", className, decorative = false }: WordmarkProps) {
  const colors = TONES[tone];
  const height = Math.round((width / WORDMARK_WIDTH) * WORDMARK_HEIGHT);
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      width={width}
      height={height}
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Hotel Villa Huber"}
      focusable="false"
    >
      <path fill={colors.accent} d={WORDMARK_HOTEL_PATH} />
      <path fill={colors.main} d={WORDMARK_NAME_PATH} />
    </svg>
  );
}
