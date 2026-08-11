/**
 * Curated, verified Unsplash images for the marketing site. Base URLs only —
 * callers append their own sizing/format params (see `unsplashUrl`).
 * Photographer credit kept alongside each entry for attribution purposes.
 */

export function unsplashUrl(base: string, opts: { w: number; h?: number; q?: number } = { w: 1600, q: 80 }) {
  const params = new URLSearchParams({
    q: String(opts.q ?? 80),
    w: String(opts.w),
    auto: "format",
    fit: "crop",
    ...(opts.h ? { h: String(opts.h) } : {}),
  });
  return `${base}?${params.toString()}`;
}

export const MARKETING_IMAGES = {
  heroBuilding: {
    base: "https://images.unsplash.com/photo-1762452059456-e4c16c256dd1",
    alt: "Modern apartment building with balconies at golden hour",
    credit: "Taha Malik",
  },
  ctaInterior: {
    base: "https://images.unsplash.com/photo-1704040686510-b747ff423ebb",
    alt: "Warm-toned living room with tasteful furniture",
    credit: "Ariel Domenden",
  },
  aboutLobby: {
    base: "https://images.unsplash.com/photo-1758448511533-e1502259fff6",
    alt: "Modern building lobby with warm wood accents",
    credit: "Aalo Lens",
  },
  trustBuilding: {
    base: "https://images.unsplash.com/photo-1785732709734-f310f99a749e",
    alt: "Grand institutional building facade",
    credit: "Matthew Jackson",
  },
  processKitchen: {
    base: "https://images.unsplash.com/photo-1682888813913-e13f18692019",
    alt: "Bright modern kitchen with marble island",
    credit: "Zac Gudakov",
  },
  servicedApartmentHero: {
    base: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab",
    alt: "Contemporary living room in warm neutral tones",
    credit: "Francesca Tosolini",
  },
  insightsDesk: {
    base: "https://images.unsplash.com/photo-1531346878377-a5be20888e57",
    alt: "Clean desk with notebook and keyboard",
    credit: "Marissa Grootes",
  },
  investmentGuideKeys: {
    base: "https://images.unsplash.com/photo-1741156386380-0236c72eb6f9",
    alt: "Hand holding house keys in front of a building entrance",
    credit: "Jakub Żerdzicki",
  },
  authPanel: {
    base: "https://images.unsplash.com/photo-1571236673892-13d222da2019",
    alt: "Brown apartment building exterior",
    credit: "Giulia May",
  },
} as const;

export const PORTFOLIO_PROPERTY_IMAGES: Record<string, { src: string; alt: string }> = {
  "Miami, Florida, USA": {
    src: "/properties/first.jpeg",
    alt: "Modern apartment building exterior with lit balconies at dusk, palm trees lining the street",
  },
  "Dallas, Texas, USA": {
    src: "/properties/two.jpeg",
    alt: "Open-concept living room and kitchen with a city skyline view at dusk",
  },
  "London, United Kingdom": {
    src: "/properties/three.jpeg",
    alt: "Living room with a sectional sofa overlooking a waterfront city skyline",
  },
  "Manchester, United Kingdom": {
    src: "/properties/four.jpeg",
    alt: "Living room with a view of the Manchester city skyline",
  },
  "Toronto, Ontario, Canada": {
    src: "/properties/five.jpeg",
    alt: "Living room with a view of the CN Tower and Toronto skyline",
  },
  "Dubai, United Arab Emirates": {
    src: "/properties/six.jpeg",
    alt: "Living room with a view of the Burj Khalifa and Dubai skyline",
  },
  "Abu Dhabi, United Arab Emirates": {
    src: "/properties/seven.jpeg",
    alt: "Living room with a view of the Abu Dhabi waterfront skyline",
  },
  "Paris, France": {
    src: "/properties/eight.jpeg",
    alt: "Parisian apartment living room with a view of the Eiffel Tower",
  },
  "Lisbon, Portugal": {
    src: "/properties/nine.jpeg",
    alt: "Living room with French doors overlooking Lisbon's terracotta rooftops",
  },
  "Cape Town, South Africa": {
    src: "/properties/ten.jpeg",
    alt: "Living room with a view of Table Mountain and Cape Town",
  },
};
