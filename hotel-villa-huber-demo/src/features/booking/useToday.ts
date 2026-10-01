import { useSyncExternalStore } from "react";
import { todayIso } from "./model";

const subscribe = () => () => {};

/**
 * A mai nap (YYYY-MM-DD) a böngésző helyi idejében.
 * Szerveren és hidratáláskor üres szöveg, így nincs hidratálási eltérés a `min` attribútumnál.
 */
export function useToday(): string {
  return useSyncExternalStore(subscribe, () => todayIso(), () => "");
}
