import { beforeEach, describe, expect, it } from "vitest";
import { useKycWizardStore } from "./kyc-wizard-store";

describe("useKycWizardStore", () => {
  beforeEach(() => {
    useKycWizardStore.getState().reset();
  });

  it("starts on the personal step", () => {
    expect(useKycWizardStore.getState().step).toBe("personal");
  });

  it("walks forward through every step in order", () => {
    const { goNext } = useKycWizardStore.getState();
    goNext();
    expect(useKycWizardStore.getState().step).toBe("document");
    goNext();
    expect(useKycWizardStore.getState().step).toBe("selfie");
    goNext();
    expect(useKycWizardStore.getState().step).toBe("review");
  });

  it("does not advance past the last step", () => {
    const { goToStep, goNext } = useKycWizardStore.getState();
    goToStep("review");
    goNext();
    expect(useKycWizardStore.getState().step).toBe("review");
  });

  it("does not go back before the first step", () => {
    const { goBack } = useKycWizardStore.getState();
    goBack();
    expect(useKycWizardStore.getState().step).toBe("personal");
  });

  it("reset clears all collected fields", () => {
    const { setPersonal, setDocument, setSelfie, goToStep, reset } = useKycWizardStore.getState();
    setPersonal({ fullName: "Jane Doe", dateOfBirth: "1990-01-01", address: "123 Main St", documentType: "passport" });
    setDocument("storage-id-1" as never, "doc.pdf");
    setSelfie("storage-id-2" as never, "selfie.png");
    goToStep("review");

    reset();

    const state = useKycWizardStore.getState();
    expect(state.step).toBe("personal");
    expect(state.personal.fullName).toBe("");
    expect(state.documentFileId).toBeNull();
    expect(state.selfieFileId).toBeNull();
  });
});
