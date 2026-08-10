"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavDropdownData } from "./nav-data";

const CLOSE_DELAY_MS = 150;

/**
 * Hover-opening dropdown for desktop nav (short close delay so moving the
 * cursor from trigger to panel doesn't flicker closed). One shared
 * implementation for About Us / Properties / Resources rather than three
 * bespoke ones — the mobile sheet renders the same NAV_DROPDOWNS data as a
 * tap-to-expand accordion instead of reusing this component.
 */
export function NavDropdown({ dropdown }: { dropdown: NavDropdownData }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function handleEnter() {
    clearTimer();
    setOpen(true);
  }

  function handleLeave() {
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        {dropdown.label}
        <ChevronDownIcon className={cn("size-3.5 transition-transform duration-150", open && "rotate-180")} />
      </button>

      <div
        className={cn(
          "absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-3 transition-all duration-150",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        )}
      >
        <div className="overflow-hidden rounded-lg border bg-popover py-2 text-popover-foreground shadow-lg ring-1 ring-foreground/5">
          {dropdown.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
