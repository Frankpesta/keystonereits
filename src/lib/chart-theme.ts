/**
 * Single source of truth for chart series colors. Pulled from the same CSS
 * custom properties as the rest of the UI (see globals.css) so charts never
 * drift from the brown/tan brand palette or fall out of sync with a future
 * theme tweak.
 */
export const CHART_COLORS = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  mutedForeground: "var(--muted-foreground)",
} as const;

export const CHART_GRID_STROKE = "var(--border)";
export const CHART_AXIS_STROKE = "var(--muted-foreground)";
