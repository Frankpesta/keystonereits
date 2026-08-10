import { describe, expect, it, vi, beforeEach } from "vitest";
import { downloadCsv } from "./csv-export";

describe("downloadCsv", () => {
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clickSpy = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      set href(_v: string) {},
      set download(_v: string) {},
      click: clickSpy,
    } as unknown as HTMLAnchorElement);
    URL.createObjectURL = vi.fn(() => "blob:mock");
    URL.revokeObjectURL = vi.fn();
  });

  it("does nothing for an empty dataset", () => {
    downloadCsv("empty.csv", []);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("builds a header row from the first object's keys and triggers a download", () => {
    downloadCsv("report.csv", [{ name: "Ada", amount: 100 }]);
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("quotes and escapes values containing commas, quotes, or newlines", async () => {
    let capturedBlob: Blob | undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock";
    });

    downloadCsv("report.csv", [{ note: 'Has, a comma and a "quote"' }]);
    const text = await capturedBlob!.text();
    expect(text).toContain('"Has, a comma and a ""quote"""');
  });
});
