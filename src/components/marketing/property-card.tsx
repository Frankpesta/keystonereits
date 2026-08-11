import Image from "next/image";
import { MapPinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PropertyCardData = {
  location: string;
  title: string;
  type: string;
  use: string;
  description: string;
  highlights: string[];
  status: "Active" | "Under Management" | "Coming Soon";
  image: { src: string; alt: string };
};

const STATUS_TONE: Record<PropertyCardData["status"], string> = {
  Active: "bg-success/10 text-success",
  "Under Management": "bg-warning/10 text-warning",
  "Coming Soon": "bg-muted text-muted-foreground",
};

export function PropertyCard({ property }: { property: PropertyCardData }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={property.image.src}
          alt={property.image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className={`absolute top-3 right-3 border-transparent ${STATUS_TONE[property.status]}`} variant="outline">
          {property.status}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="size-3.5" />
          {property.location}
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{property.title}</h3>
        <p className="text-xs font-medium text-muted-foreground">
          {property.type} · {property.use}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {property.highlights.map((h) => (
            <li key={h} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
