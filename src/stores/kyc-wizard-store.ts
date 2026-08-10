import { create } from "zustand";
import type { Id } from "@/lib/convex-api";

export type KycStep = "personal" | "document" | "selfie" | "review";
const STEP_ORDER: KycStep[] = ["personal", "document", "selfie", "review"];

export type KycPersonalInfo = {
  fullName: string;
  dateOfBirth: string;
  address: string;
  documentType: string;
};

type KycWizardState = {
  step: KycStep;
  personal: KycPersonalInfo;
  documentFileId: Id<"_storage"> | null;
  documentFileName: string | null;
  selfieFileId: Id<"_storage"> | null;
  selfieFileName: string | null;
  setPersonal: (personal: KycPersonalInfo) => void;
  setDocument: (fileId: Id<"_storage">, fileName: string) => void;
  setSelfie: (fileId: Id<"_storage">, fileName: string) => void;
  clearSelfie: () => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: KycStep) => void;
  reset: () => void;
};

const INITIAL_PERSONAL: KycPersonalInfo = {
  fullName: "",
  dateOfBirth: "",
  address: "",
  documentType: "",
};

export const useKycWizardStore = create<KycWizardState>((set, get) => ({
  step: "personal",
  personal: INITIAL_PERSONAL,
  documentFileId: null,
  documentFileName: null,
  selfieFileId: null,
  selfieFileName: null,
  setPersonal: (personal) => set({ personal }),
  setDocument: (fileId, fileName) => set({ documentFileId: fileId, documentFileName: fileName }),
  setSelfie: (fileId, fileName) => set({ selfieFileId: fileId, selfieFileName: fileName }),
  clearSelfie: () => set({ selfieFileId: null, selfieFileName: null }),
  goNext: () => {
    const index = STEP_ORDER.indexOf(get().step);
    if (index < STEP_ORDER.length - 1) set({ step: STEP_ORDER[index + 1] });
  },
  goBack: () => {
    const index = STEP_ORDER.indexOf(get().step);
    if (index > 0) set({ step: STEP_ORDER[index - 1] });
  },
  goToStep: (step) => set({ step }),
  reset: () =>
    set({
      step: "personal",
      personal: INITIAL_PERSONAL,
      documentFileId: null,
      documentFileName: null,
      selfieFileId: null,
      selfieFileName: null,
    }),
}));

export { STEP_ORDER };
