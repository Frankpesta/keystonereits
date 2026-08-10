import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The 4:5 portrait photo used throughout image/text split sections — wrapped
 * in a slightly offset accent-colored frame for a layered, editorial feel
 * rather than a flat cropped rectangle.
 */
export function FramedImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -right-4 -bottom-4 h-full w-full rounded-2xl border-2 border-accent/40" aria-hidden />
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl shadow-lg">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  );
}
