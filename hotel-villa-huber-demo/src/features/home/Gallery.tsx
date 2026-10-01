"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { objectPosition } from "@/content/media";
import type { MediaAsset } from "@/content/types";
import styles from "./Gallery.module.css";

interface GalleryProps {
  items: readonly MediaAsset[];
}

export function Gallery({ items }: GalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const total = items.length;
  const current = index === null ? null : (items[index] ?? null);

  function openAt(i: number, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setIndex(i);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    closeRef.current?.focus();
  }

  function close() {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }

  function step(delta: number) {
    setIndex((i) => (i === null ? i : (i + delta + total) % total));
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  }

  function onDialogClick(event: MouseEvent<HTMLDialogElement>) {
    // Kattintás a háttérre (a vezérlőkön és a képen kívül) bezár.
    const target = event.target as HTMLElement;
    if (!target.closest("[data-lightbox-keep]")) close();
  }

  function onDialogClose() {
    setIndex(null);
    triggerRef.current?.focus();
  }

  return (
    <>
      <ul className={styles.grid}>
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.thumb}
              aria-haspopup="dialog"
              onClick={(event) => openAt(i, event.currentTarget)}
            >
              <span className={styles.thumbFrame}>
                <Image
                  src={item.src}
                  alt=""
                  width={item.width}
                  height={item.height}
                  sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 50vw"
                  loading="lazy"
                  style={{ objectPosition: objectPosition(item) }}
                />
              </span>
              <span className={styles.thumbCaption}>{item.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Galéria — nagyított kép"
        onKeyDown={onDialogKeyDown}
        onClick={onDialogClick}
        onClose={onDialogClose}
      >
        <div className={styles.stage}>
          <div className={styles.top} data-lightbox-keep>
            <p className={styles.counter} aria-live="polite">
              {index !== null ? `${index + 1} / ${total}` : ""}
            </p>
            <button ref={closeRef} type="button" className={styles.control} onClick={close}>
              Bezárás
            </button>
          </div>

          <figure className={styles.figure}>
            {current ? (
              <>
                <Image
                  key={current.id}
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  loading="eager"
                  className={styles.image}
                  data-lightbox-keep
                />
                <figcaption className={styles.caption} data-lightbox-keep>
                  {current.caption}
                </figcaption>
              </>
            ) : null}
          </figure>

          <button
            type="button"
            className={`${styles.control} ${styles.prev}`}
            onClick={() => step(-1)}
            aria-label="Előző kép"
            data-lightbox-keep
          >
            <span aria-hidden="true">←</span>
            <span>Előző</span>
          </button>
          <button
            type="button"
            className={`${styles.control} ${styles.next}`}
            onClick={() => step(1)}
            aria-label="Következő kép"
            data-lightbox-keep
          >
            <span>Következő</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </dialog>
    </>
  );
}
