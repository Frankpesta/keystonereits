import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, STATUS_TONE_MAP, formatLabel } from "@/components/shared/status-badge";

describe("formatLabel", () => {
  it("capitalizes single words", () => {
    expect(formatLabel("pending")).toBe("Pending");
  });

  it("splits underscores into title-cased words", () => {
    expect(formatLabel("under_review")).toBe("Under Review");
    expect(formatLabel("not_started")).toBe("Not Started");
  });
});

describe("STATUS_TONE_MAP status color convention", () => {
  const success = ["approved", "confirmed", "credited", "completed", "active"];
  const warning = ["pending", "under_review", "confirming", "maturing", "processing"];
  const destructive = ["rejected", "failed", "cancelled"];
  const muted = ["draft", "not_started", "archived", "closed"];

  it.each(success)("%s maps to success", (status) => {
    expect(STATUS_TONE_MAP[status]).toBe("success");
  });

  it.each(warning)("%s maps to warning", (status) => {
    expect(STATUS_TONE_MAP[status]).toBe("warning");
  });

  it.each(destructive)("%s maps to destructive", (status) => {
    expect(STATUS_TONE_MAP[status]).toBe("destructive");
  });

  it.each(muted)("%s maps to muted", (status) => {
    expect(STATUS_TONE_MAP[status]).toBe("muted");
  });

  it("falls back to muted for an unrecognized status", () => {
    expect(STATUS_TONE_MAP["something_unknown"]).toBeUndefined();
  });
});

describe("<StatusBadge />", () => {
  it("renders a formatted label derived from the status", () => {
    render(<StatusBadge status="under_review" />);
    expect(screen.getByText("Under Review")).toBeInTheDocument();
  });

  it("renders a custom label override when provided", () => {
    render(<StatusBadge status="pending" label="Awaiting Confirmation" />);
    expect(screen.getByText("Awaiting Confirmation")).toBeInTheDocument();
  });

  it("defaults an unmapped status to the muted tone classes", () => {
    render(<StatusBadge status="totally_unknown" />);
    const badge = screen.getByText("Totally Unknown");
    expect(badge.className).toContain("bg-muted");
  });

  it("applies the success tone classes for a success-mapped status", () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByText("Active");
    expect(badge.className).toContain("bg-success/10");
    expect(badge.className).toContain("text-success");
  });
});
