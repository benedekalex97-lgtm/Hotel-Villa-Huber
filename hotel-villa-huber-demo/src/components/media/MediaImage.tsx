import Image from "next/image";
import type { CSSProperties } from "react";
import type { MediaAsset } from "@/content/types";
import { objectPosition } from "@/content/media";
import { Wordmark } from "@/components/brand/Wordmark";
import styles from "./MediaImage.module.css";

type Ratio = "hero" | "landscape" | "wide" | "portrait" | "square" | "native";

interface MediaImageProps {
  /** Manifest-elem. `null` esetén rendezett, cserére előkészített üres képterület jelenik meg. */
  asset: MediaAsset | null;
  ratio?: Ratio;
  /** next/image `sizes` — a valós megjelenítési szélességhez igazítsd. */
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Képaláírás megjelenítése figcaptionként. */
  withCaption?: boolean;
  /** Ha a kép dekoratív a környezetéhez képest (a szöveg már leírja). */
  decorative?: boolean;
}

function ratioValue(ratio: Ratio, asset: MediaAsset | null): string {
  if (ratio === "native") return asset ? `${asset.width} / ${asset.height}` : "3 / 2";
  return `var(--hvh-ratio-${ratio})`;
}

/**
 * Egységes képkomponens a manifest alapján: fókuszpont, arány, lazy loading.
 * A hero képnél `priority` kell; minden más lazy.
 */
export function MediaImage({ asset, ratio = "landscape", sizes, priority = false, className, withCaption = false, decorative = false }: MediaImageProps) {
  const frameStyle: CSSProperties = { aspectRatio: ratioValue(ratio, asset) };

  const frame = (
    <div className={`${styles.frame} ${withCaption ? "" : className ?? ""}`} style={frameStyle}>
      {asset ? (
        <Image
          src={asset.src}
          alt={decorative ? "" : asset.alt}
          width={asset.width}
          height={asset.height}
          sizes={sizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? "eager" : "lazy"}
          style={{ objectPosition: objectPosition(asset) }}
        />
      ) : (
        <div className={styles.placeholder} role="img" aria-label="Kép hamarosan">
          <Wordmark width={110} tone="ink" decorative />
        </div>
      )}
    </div>
  );

  if (!withCaption) return frame;
  return (
    <figure className={`${styles.figure} ${className ?? ""}`}>
      {frame}
      {asset ? <figcaption className={styles.caption}>{asset.caption}</figcaption> : null}
    </figure>
  );
}
