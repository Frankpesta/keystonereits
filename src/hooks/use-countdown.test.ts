import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at 0 before start() is called", () => {
    const { result } = renderHook(() => useCountdown(60));
    expect(result.current.secondsLeft).toBe(0);
  });

  it("counts down by one each second after start()", () => {
    const { result } = renderHook(() => useCountdown(3));

    act(() => result.current.start());
    expect(result.current.secondsLeft).toBe(3);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(2);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(1);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(0);
  });

  it("does not go below 0", () => {
    const { result } = renderHook(() => useCountdown(1));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.secondsLeft).toBe(0);
  });

  it("restarting resets the countdown", () => {
    const { result } = renderHook(() => useCountdown(5));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.secondsLeft).toBe(2);

    act(() => result.current.start());
    expect(result.current.secondsLeft).toBe(5);
  });

  it("clears its interval on unmount without throwing", () => {
    const { result, unmount } = renderHook(() => useCountdown(10));
    act(() => result.current.start());
    expect(() => unmount()).not.toThrow();
  });
});
