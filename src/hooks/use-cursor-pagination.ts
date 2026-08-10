import { useState } from "react";

/**
 * Convex's `.paginate()` only hands back a forward cursor, not random page
 * access — this keeps the stack of cursors seen so far so a shadcn
 * Pagination-style Previous/Next UI can page backward without re-querying
 * from the start. Pass a value that should reset paging back to page one
 * (e.g. the current filter state) as `resetKey`.
 *
 * Resetting on a prop/key change is done by adjusting state during render
 * (React's documented pattern for this exact case) rather than
 * useEffect+setState, which re-renders an extra, avoidable time.
 */
export function useCursorPagination(resetKey: unknown) {
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setCursorStack([null]);
    setPageIndex(0);
  }

  function goNext(continueCursor: string, isDone: boolean) {
    if (isDone) return;
    setCursorStack((stack) => (pageIndex === stack.length - 1 ? [...stack, continueCursor] : stack));
    setPageIndex((i) => i + 1);
  }

  function goPrev() {
    setPageIndex((i) => Math.max(0, i - 1));
  }

  const isResetting = resetKey !== prevResetKey;

  return {
    cursor: isResetting ? null : cursorStack[pageIndex],
    pageNumber: isResetting ? 1 : pageIndex + 1,
    hasPrev: isResetting ? false : pageIndex > 0,
    goNext,
    goPrev,
  };
}
