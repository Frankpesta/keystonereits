"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { CheckIcon, Loader2Icon, UploadIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { uploadFile } from "@/lib/upload-file";
import { kycPersonalSchema, DOCUMENT_TYPES, type KycPersonalInput } from "@/lib/validation/kyc";
import { useKycWizardStore, STEP_ORDER, type KycStep } from "@/stores/kyc-wizard-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STEP_LABELS: Record<KycStep, string> = {
  personal: "Personal Info",
  document: "Document",
  selfie: "Selfie",
  review: "Review",
};

function Stepper({ current }: { current: KycStep }) {
  const currentIndex = STEP_ORDER.indexOf(current);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STEP_ORDER.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
              index < currentIndex && "border-primary bg-primary text-primary-foreground",
              index === currentIndex && "border-primary text-primary",
              index > currentIndex && "text-muted-foreground"
            )}
          >
            {index < currentIndex ? <CheckIcon className="size-3.5" /> : index + 1}
          </div>
          <span
            className={cn(
              "hidden text-sm sm:inline",
              index === currentIndex ? "font-medium" : "text-muted-foreground"
            )}
          >
            {STEP_LABELS[step]}
          </span>
          {index < STEP_ORDER.length - 1 && <div className="h-px w-6 bg-border sm:w-10" />}
        </div>
      ))}
    </div>
  );
}

function PersonalStep() {
  const personal = useKycWizardStore((s) => s.personal);
  const setPersonal = useKycWizardStore((s) => s.setPersonal);
  const goNext = useKycWizardStore((s) => s.goNext);
  const form = useForm<KycPersonalInput>({ resolver: zodResolver(kycPersonalSchema), defaultValues: personal });

  function onSubmit(values: KycPersonalInput) {
    setPersonal(values);
    goNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full legal name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residential address</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DOCUMENT_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2 self-end">
          Continue
        </Button>
      </form>
    </Form>
  );
}

function FileUploadField({
  description,
  fileName,
  onUploaded,
}: {
  description: string;
  fileName: string | null;
  onUploaded: (fileId: Id<"_storage">, name: string) => void;
}) {
  const sessionToken = useSessionToken();
  const generateUploadUrl = useMutation(api.kyc.generateUploadUrl);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({ sessionToken });
      const fileId = await uploadFile(uploadUrl, file);
      onUploaded(fileId, file.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{description}</p>
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center hover:bg-muted/50",
          fileName && "border-primary/40 bg-primary/5"
        )}
      >
        {uploading ? (
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <UploadIcon className="size-6 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{fileName ?? "Click to upload a file"}</span>
        <span className="text-xs text-muted-foreground">JPG, PNG, or PDF, up to 10MB</span>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </label>
    </div>
  );
}

function DocumentStep() {
  const documentFileName = useKycWizardStore((s) => s.documentFileName);
  const setDocument = useKycWizardStore((s) => s.setDocument);
  const goNext = useKycWizardStore((s) => s.goNext);
  const goBack = useKycWizardStore((s) => s.goBack);

  return (
    <div className="flex flex-col gap-4">
      <FileUploadField
        description="Upload a clear photo or scan of your government-issued ID (passport, national ID, or driver's license)."
        fileName={documentFileName}
        onUploaded={setDocument}
      />
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="button" disabled={!documentFileName} onClick={goNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function SelfieStep() {
  const selfieFileName = useKycWizardStore((s) => s.selfieFileName);
  const setSelfie = useKycWizardStore((s) => s.setSelfie);
  const goNext = useKycWizardStore((s) => s.goNext);
  const goBack = useKycWizardStore((s) => s.goBack);

  return (
    <div className="flex flex-col gap-4">
      <FileUploadField
        description="Optional — a selfie helps us verify your identity faster."
        fileName={selfieFileName}
        onUploaded={setSelfie}
      />
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="button" onClick={goNext}>
          {selfieFileName ? "Continue" : "Skip"}
        </Button>
      </div>
    </div>
  );
}

function ReviewStep() {
  const router = useRouter();
  const sessionToken = useSessionToken();
  const { personal, documentFileId, documentFileName, selfieFileId, goBack, reset } = useKycWizardStore();
  const submit = useMutation(api.kyc.submit);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!documentFileId) {
      toast.error("Please upload your identity document first.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        sessionToken,
        ...personal,
        documentFileId,
        selfieFileId: selfieFileId ?? undefined,
      });
      toast.success("Your KYC application has been submitted for review.");
      reset();
      router.refresh();
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Full name</dt>
          <dd className="font-medium">{personal.fullName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Date of birth</dt>
          <dd className="font-medium">{personal.dateOfBirth}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Address</dt>
          <dd className="font-medium">{personal.address}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Document type</dt>
          <dd className="font-medium">
            {DOCUMENT_TYPES.find((d) => d.value === personal.documentType)?.label ?? personal.documentType}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Document file</dt>
          <dd className="font-medium">{documentFileName ?? "—"}</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={goBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Submit for review"}
        </Button>
      </div>
    </div>
  );
}

const STEP_DESCRIPTIONS: Record<KycStep, string> = {
  personal: "Tell us a bit about yourself.",
  document: "Upload your government-issued ID.",
  selfie: "Add a selfie to speed up verification.",
  review: "Review your details before submitting.",
};

export function KycWizard() {
  const step = useKycWizardStore((s) => s.step);

  return (
    <Card>
      <CardHeader className="gap-4">
        <Stepper current={step} />
        <div>
          <CardTitle>{STEP_LABELS[step]}</CardTitle>
          <CardDescription>{STEP_DESCRIPTIONS[step]}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {step === "personal" && <PersonalStep />}
        {step === "document" && <DocumentStep />}
        {step === "selfie" && <SelfieStep />}
        {step === "review" && <ReviewStep />}
      </CardContent>
    </Card>
  );
}
