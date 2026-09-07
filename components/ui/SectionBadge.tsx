import { cn } from "@/lib/utils";

export type SectionBadgeVariant = "green" | "outline" | "dark";

interface SectionBadgeProps {
  children: React.ReactNode;
  variant?: SectionBadgeVariant;
  className?: string;
  /** Optional leading/trailing dot (Figma "Rectangle 3") */
  showDot?: boolean;
  dotSize?: string;
  dotPosition?: "left" | "right";
}

const badgeVariants: Record<SectionBadgeVariant, string> = {
  // Green pill — Figma "About Malik Seeds", "Success stories", etc.
  green: "bg-brand-light-green text-brand-active",
  // White pill with border — Figma "Success stories", "News & Stories"
  outline:
    "bg-brand-neutral-light border border-brand-border text-brand-active",
  // Dark translucent — Figma "Timeline" badge on dark bg
  dark: "bg-brand-dark/32 border border-white/12 text-[#F2F7F1]",
};

const dotVariants: Record<SectionBadgeVariant, string> = {
  green: "bg-current",
  outline: "bg-current",
  dark: "bg-[#A9E179]",
};

/**
 * Reusable section badge / label chip.
 * Used to label sections like "About Malik Seeds", "Success stories", "Timeline".
 * Matches Figma: h-[33px], rounded-[30px], Inter font, 14px/500.
 */
export function SectionBadge({
  children,
  variant = "green",
  className,
  showDot = false,
  dotSize = "8px",
  dotPosition = "left",
}: SectionBadgeProps) {
  const dotEl = showDot && (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ height: dotSize, width: dotSize }}
    >
      {/* ping ring — same shape/color as the icon, just animated + behind it */}
      <span
        className={cn(
          "animate-badge-glow absolute inline-flex h-full w-full rounded-full",
          dotVariants[variant]
        )}
      />
      {/* the actual icon — static, always visible */}
      <span
        className={cn(
          "relative inline-flex h-full w-full rounded-full",
          dotVariants[variant]
        )}
        style={{ height: dotSize, width: dotSize }}
      />
    </span>
  );

  return (
    <div
      className={cn(
        "inline-flex h-[33px] w-fit items-center justify-center gap-2 rounded-[30px] px-4",
        "text-[12px] leading-[21px] font-medium md:text-[14px]",
        badgeVariants[variant],
        className,
        "uppercase"
      )}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {showDot && dotPosition === "left" && dotEl}
      {children}
      {showDot && dotPosition === "right" && dotEl}
    </div>
  );
}
