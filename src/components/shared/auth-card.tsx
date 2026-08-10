import Image from "next/image";
import Link from "next/link";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";
import { Logo } from "@/components/shared/logo";
import type { ReactNode } from "react";

/**
 * Shared two-column shell for every auth screen on both surfaces (signup,
 * login, OTP verify, forgot/reset password — user and admin). Left: form.
 * Right: full-height brand image, hidden below lg. Do not build bespoke
 * layouts per screen.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
  logoHref = "/",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  logoHref?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-16">
        <div className="w-full max-w-sm">
          <Link href={logoHref} className="flex items-center gap-2">
            <Logo height={40} />
          </Link>

          <div className="mt-10">
            <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
            {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
          </div>

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src={unsplashUrl(MARKETING_IMAGES.authPanel.base, { w: 1400, h: 1800 })}
          alt={MARKETING_IMAGES.authPanel.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="font-display text-2xl leading-snug font-medium text-primary-foreground text-balance">
            Real estate. Made more accessible.
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
            Build a stake in professionally managed serviced apartments and short-term rental properties, starting
            from $200.
          </p>
        </div>
      </div>
    </div>
  );
}
