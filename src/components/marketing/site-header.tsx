"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavDropdown } from "./nav-dropdown";
import { NAV_DROPDOWNS } from "./nav-data";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo height={36} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
            Home
          </Link>
          <NavDropdown dropdown={NAV_DROPDOWNS[0]} />
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            How It Works
          </Link>
          <Link
            href="/investment-plans"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Investment Plans
          </Link>
          <NavDropdown dropdown={NAV_DROPDOWNS[1]} />
          <NavDropdown dropdown={NAV_DROPDOWNS[2]} />
          <Link
            href="/contact"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="px-3 text-sm font-medium text-foreground/80 hover:text-foreground">
            Sign In
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm gap-0 p-0 sm:max-w-sm">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle className="flex items-center gap-2 text-left">
                <Logo height={28} />
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="border-b py-3.5 text-sm font-medium text-foreground"
              >
                Home
              </Link>

              <Accordion type="multiple" className="w-full">
                {NAV_DROPDOWNS.map((dropdown) => (
                  <AccordionItem key={dropdown.label} value={dropdown.label}>
                    <AccordionTrigger className="text-sm font-medium">{dropdown.label}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1 pb-2">
                        {dropdown.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Link
                href="/how-it-works"
                onClick={() => setMobileOpen(false)}
                className="border-b py-3.5 text-sm font-medium text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="/investment-plans"
                onClick={() => setMobileOpen(false)}
                className="border-b py-3.5 text-sm font-medium text-foreground"
              >
                Investment Plans
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="border-b py-3.5 text-sm font-medium text-foreground"
              >
                Contact
              </Link>

              <div className="mt-6 flex flex-col gap-3">
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
