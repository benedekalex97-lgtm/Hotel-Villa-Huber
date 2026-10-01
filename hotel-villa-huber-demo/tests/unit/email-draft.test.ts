import { describe, expect, it } from "vitest";
import { draftReducer, initialDraftState, type DraftAction, type DraftState } from "@/features/email/draft";

const run = (...actions: DraftAction[]): DraftState => actions.reduce(draftReducer, initialDraftState());

describe("vázlatállapot", () => {
  it("nem szerkesztett szöveg élőben frissül a mezőkből", () => {
    const s = run({ type: "setValue", name: "recipientName", value: "Kiss Béla" });
    expect(s.drafts.investor.body.startsWith("Tisztelt Kiss Béla!")).toBe(true);
    expect(s.drafts.investor.bodyEdited).toBe(false);
  });

  it("a kézi szerkesztést mezőváltozás nem írja felül, csak értesítést kér", () => {
    const s = run(
      { type: "edit", field: "body", text: "Saját szöveg [Név]" },
      { type: "setValue", name: "recipientName", value: "Kiss Béla" },
    );
    expect(s.drafts.investor.body).toBe("Saját szöveg [Név]");
    expect(s.drafts.investor.bodyEdited).toBe(true);
    expect(s.drafts.investor.bodySkipped).toBe(true);
    // A tárgyat nem szerkesztették: frissül, értesítés nélkül.
    expect(s.drafts.investor.subjectSkipped).toBe(false);
  });

  it("sablonváltás nem veszíti el a kézi szerkesztést, a másik sablon közben követi a mezőket", () => {
    const s = run(
      { type: "edit", field: "subject", text: "Saját tárgy" },
      { type: "select", id: "followup" },
      { type: "setValue", name: "senderName", value: "Nagy Anna" },
      { type: "select", id: "investor" },
    );
    expect(s.drafts.investor.subject).toBe("Saját tárgy");
    expect(s.drafts.investor.subjectEdited).toBe(true);
    expect(s.drafts.followup.body).toContain("Üdvözlettel:\nNagy Anna");
  });

  it("frissítés és megtartás működik; a visszaállítás törli a kézi módosítást", () => {
    const base = run({ type: "edit", field: "body", text: "Kézi" }, { type: "setValue", name: "senderName", value: "Nagy Anna" });
    const kept = draftReducer(base, { type: "keep", field: "body" });
    expect(kept.drafts.investor.body).toBe("Kézi");
    expect(kept.drafts.investor.bodySkipped).toBe(false);
    expect(kept.drafts.investor.bodyEdited).toBe(true);

    const refreshed = draftReducer(base, { type: "refresh", field: "body" });
    expect(refreshed.drafts.investor.body).toContain("Üdvözlettel:\nNagy Anna");
    expect(refreshed.drafts.investor.bodyEdited).toBe(false);

    const reset = draftReducer(base, { type: "reset" });
    expect(reset.drafts.investor.body).toContain("Üdvözlettel:\nNagy Anna");
    expect(reset.drafts.investor.bodyEdited).toBe(false);
    expect(reset.drafts.investor.bodySkipped).toBe(false);
  });

  it("a nem használt mezők értéke sablonváltáskor megmarad", () => {
    const s = run({ type: "setValue", name: "companyName", value: "Minta Kft." }, { type: "select", id: "followup" });
    expect(s.values.companyName).toBe("Minta Kft.");
  });
});
