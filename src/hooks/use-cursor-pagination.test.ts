import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCursorPagination } from "./use-cursor-pagination";

describe("useCursorPagination", () => {
  it("starts on page 1 with a null cursor", () => {
    const { result } = renderHook(() => useCursorPagination("all"));
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.cursor).toBeNull();
    expect(result.current.hasPrev).toBe(false);
  });

  it("advances the cursor stack on goNext and can go back", () => {
    const { result } = renderHook(() => useCursorPagination("all"));

    act(() => result.current.goNext("cursor-1", false));
    expect(result.current.pageNumber).toBe(2);
    expect(result.current.cursor).toBe("cursor-1");
    expect(result.current.hasPrev).toBe(true);

    act(() => result.current.goPrev());
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.cursor).toBeNull();
  });

  it("does not advance past the last page", () => {
    const { result } = renderHook(() => useCursorPagination("all"));
    act(() => result.current.goNext("cursor-1", true));
    expect(result.current.pageNumber).toBe(1);
  });

  it("reuses a previously-seen cursor instead of re-fetching when paging forward again", () => {
    const { result } = renderHook(() => useCursorPagination("all"));
    act(() => result.current.goNext("cursor-1", false));
    act(() => result.current.goPrev());
    act(() => result.current.goNext("cursor-1-different", false));
    // Still the originally-seen cursor for page 2, not the new value passed in.
    expect(result.current.cursor).toBe("cursor-1");
  });

  it("resets to page 1 when the reset key changes", () => {
    const { result, rerender } = renderHook(({ key }) => useCursorPagination(key), {
      initialProps: { key: "all" },
    });
    act(() => result.current.goNext("cursor-1", false));
    expect(result.current.pageNumber).toBe(2);

    rerender({ key: "deposit" });
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.cursor).toBeNull();
  });
});
