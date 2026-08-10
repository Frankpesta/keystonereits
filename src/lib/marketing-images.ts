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
  featuredPropertyLiving: {
    base: "https://images.unsplash.com/photo-1741764014072-68953e93cd48",
    alt: "Modern open-concept living room",
    credit: "Melrose By The Lake",
  },
  featuredPropertyBalcony: {
    base: "https://images.unsplash.com/photo-1560448205-d82bf18b9bcf",
    alt: "Furnished balcony with wicker armchairs",
    credit: "Francesca Tosolini",
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

export const PORTFOLIO_PROPERTY_IMAGES: Record<string, { base: string; alt: string; credit: string }> = {
  "Miami, Florida, USA": {
    base: "https://images.unsplash.com/photo-1506079478915-3f458c5077a7",
    alt: "Modern white and orange concrete apartment building, low-angle view",
    credit: "Jason Briscoe",
  },
  "Dallas, Texas, USA": {
    base: "https://images.unsplash.com/photo-1720098848662-fc6b28c7e694",
    alt: "Tall modern residential tower with a window grid facade",
    credit: "Paul Rivera",
  },
  "London, United Kingdom": {
    base: "https://images.unsplash.com/photo-1676680071181-0a0b45968d23",
    alt: "Tall brick apartment building with balconies",
    credit: "Seb Doe",
  },
  "Manchester, United Kingdom": {
    base: "https://images.unsplash.com/photo-1747994569200-65db9c8ec753",
    alt: "Apartment building with sunlight hitting the balconies",
    credit: "Henry Williams",
  },
  "Toronto, Ontario, Canada": {
    base: "https://images.unsplash.com/photo-1707012571400-95390edd45e3",
    alt: "Contemporary residential towers side by side",
    credit: "tonny huang",
  },
  "Dubai, United Arab Emirates": {
    base: "https://images.unsplash.com/photo-1544092683-c0c9ebb368e5",
    alt: "Burj Khalifa amid the Dubai skyline",
    credit: "K T",
  },
  "Abu Dhabi, United Arab Emirates": {
    base: "https://images.unsplash.com/photo-1668060742975-9a462159b0bd",
    alt: "Abu Dhabi waterfront skyline reflected on water",
    credit: "Karthik B K",
  },
  "Paris, France": {
    base: "https://images.unsplash.com/photo-1751838024459-5e79145905ef",
    alt: "Elegant Parisian building against a bright blue sky",
    credit: "tonny huang",
  },
  "Lisbon, Portugal": {
    base: "https://images.unsplash.com/photo-1754765297352-c63d9713895d",
    alt: "Modern white buildings under a bright blue sky",
    credit: "Ivan Rohovchenko",
  },
  "Cape Town, South Africa": {
    base: "https://images.unsplash.com/photo-1542877332-12caa90d23e2",
    alt: "High-rise residential buildings overlooking the ocean",
    credit: "Tim Johnson",
  },
};
