import { HomeIcon, HammerIcon, UsersIcon, SettingsIcon, BanknoteIcon } from "lucide-react";

const ITEMS = [
  { icon: HomeIcon, title: "Property Sourcing", description: "We identify suitable real estate opportunities." },
  {
    icon: HammerIcon,
    title: "Property Preparation",
    description: "Properties are acquired and furnished for their intended use.",
  },
  {
    icon: UsersIcon,
    title: "Guest Accommodation",
    description: "Properties are made available to short-term guests.",
  },
  {
    icon: SettingsIcon,
    title: "Property Management",
    description: "The operational side of the properties is professionally managed.",
  },
  {
    icon: BanknoteIcon,
    title: "Income Distribution",
    description: "Generated income is distributed to investors according to the applicable investment terms.",
  },
];

/** "We handle the property side" five-item list — reused verbatim on /investment-plans and /resources/investment-guide. */
export function WhyParticipateGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {ITEMS.map((item) => (
        <div
          key={item.title}
          className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-sm">
            <item.icon className="size-5" />
          </div>
          <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
