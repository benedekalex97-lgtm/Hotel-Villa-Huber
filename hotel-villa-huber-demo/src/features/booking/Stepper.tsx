import { STEPS, type StepId } from "./flow-state";
import styles from "./BookingFlow.module.css";

interface StepperProps {
  current: Exclude<StepId, 6>;
  onGo: (step: Exclude<StepId, 6>) => void;
}

/** Lépésjelző: a kész lépések gombok (vissza lehet lépni), az aktuális `aria-current="step"`. */
export function Stepper({ current, onGo }: StepperProps) {
  const currentLabel = STEPS.find((step) => step.id === current)?.label ?? "";
  return (
    <nav aria-label="Foglalási lépések" className={styles.stepper}>
      <ol className={styles.stepList}>
        {STEPS.map((step) => {
          const state = step.id < current ? "done" : step.id === current ? "current" : "todo";
          const content = (
            <>
              <span className={styles.stepNum} aria-hidden="true">
                {step.id}
              </span>
              <span className={styles.stepLabel}>
                <span className="hvh-visually-hidden">{state === "done" ? "Visszalépés: " : ""}</span>
                {step.label}
              </span>
            </>
          );
          return (
            <li key={step.id} className={styles.step} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              {state === "done" ? (
                <button type="button" className={styles.stepBtn} onClick={() => onGo(step.id)}>
                  {content}
                </button>
              ) : (
                <span className={styles.stepBtn}>{content}</span>
              )}
            </li>
          );
        })}
      </ol>
      <p className={styles.stepCurrent} aria-hidden="true">
        {current}. lépés / {STEPS.length} — {currentLabel}
      </p>
    </nav>
  );
}
