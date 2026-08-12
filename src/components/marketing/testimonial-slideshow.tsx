"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Testimonial = { quote: string; body: string; name: string; location: string };

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The process was much simpler than I expected.",
    body: "I was initially interested in real estate but didn't want the responsibility of buying and managing a property myself. Keystone REIT gave me a much simpler way to participate and understand how the model works.",
    name: "Daniel Carter",
    location: "United States",
  },
  {
    quote: "I liked the structure and transparency.",
    body: "What stood out to me was how clearly the investment process was explained. I could see how the funds are pooled, how the properties are operated, and how distributions work.",
    name: "Olivia Bennett",
    location: "United Kingdom",
  },
  {
    quote: "A different way to participate in real estate.",
    body: "I've always viewed real estate as something that requires substantial capital. Being able to participate from a lower entry point made the opportunity much more accessible to me.",
    name: "Ethan Thompson",
    location: "Canada",
  },
  {
    quote: "The team made the process straightforward.",
    body: "From selecting a plan to understanding the applicable terms, the process was straightforward. I also appreciate that the property management side is handled professionally.",
    name: "Ahmed Al Mansouri",
    location: "United Arab Emirates",
  },
  {
    quote: "I wanted real estate exposure without managing a property.",
    body: "I didn't want to deal with tenants, furnishing, guest bookings, or the daily responsibilities that come with running a short-term rental. Keystone REIT's model was appealing because the property operations are professionally managed.",
    name: "Camille Laurent",
    location: "France",
  },
  {
    quote: "It gave me another way to think about real estate.",
    body: "Keystone REIT helped me see that participating in real estate doesn't necessarily mean purchasing an entire property yourself. The model gave me another option to consider.",
    name: "Javier Morales",
    location: "Spain",
  },
  {
    quote: "The investment process was easy to understand.",
    body: "I appreciate how the different investment plans are presented with their applicable terms. It made it easier for me to review the options and choose the one that suited me.",
    name: "Michael Anderson",
    location: "United States",
  },
  {
    quote: "I'm glad I explored the opportunity.",
    body: "I was looking for a structured way to participate in real estate without having to manage everything myself. After reviewing the information and understanding the terms, I decided to participate through Keystone REIT.",
    name: "Liam Williams",
    location: "Australia",
  },
];

const AUTOPLAY_MS = 7000;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Autoplaying, pauses on hover/focus and respects prefers-reduced-motion; fully operable via the prev/next buttons and dots regardless. */
export function TestimonialSlideshow() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  const current = TESTIMONIALS[index];

  function goPrev() {
    setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }
  function goNext() {
    setIndex((i) => (i + 1) % TESTIMONIALS.length);
  }

  return (
    <div
      className="mx-auto max-w-3xl"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocus={() => (pausedRef.current = true)}
      onBlur={() => (pausedRef.current = false)}
    >
      <div className="relative overflow-hidden rounded-xl border bg-card p-8 shadow-sm sm:p-10">
        <QuoteIcon className="size-9 text-accent/40" aria-hidden />
        <div key={index} className="mt-4 animate-in fade-in-0 duration-500">
          <p className="text-balance font-display text-xl font-semibold text-foreground sm:text-2xl">
            &ldquo;{current.quote}&rdquo;
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{current.body}</p>
          <div className="mt-6 flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-sm font-semibold text-primary-foreground"
              aria-hidden
            >
              {initials(current.name)}
            </div>
            <div>
              <p className="font-medium text-foreground">{current.name}</p>
              <p className="text-sm text-muted-foreground">{current.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={goPrev}
          aria-label="Previous testimonial"
        >
          <ChevronLeftIcon />
        </Button>
        <div className="flex items-center gap-2">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial from ${t.name}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={goNext}
          aria-label="Next testimonial"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
