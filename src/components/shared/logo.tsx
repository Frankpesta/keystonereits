import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_ASPECT_RATIO = 600 / 452;

/** Full lockup (icon + "Keystone Reit" wordmark) — public/logo.png. */
export function Logo({ className, height = 36 }: { className?: string; height?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Keystone REIT"
      width={Math.round(height * LOGO_ASPECT_RATIO)}
      height={height}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height }}
      priority
    />
  );
}

/** Icon-only mark (no wordmark) — public/favicon-512.png. For compact contexts like a collapsed sidebar. */
export function LogoMark({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/favicon-512.png"
      alt="Keystone REIT"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
