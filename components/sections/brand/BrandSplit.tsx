import OptimizedImage from "@/components/ui/OptimizedImage";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { cn } from "@/lib/utils";

interface StatCard {
  value: string;
  label: string;
}

interface BrandSplitProps {
  badge: string;
  title: string;
  description?: string;
  bullets?: string[];
  statCard?: StatCard;
  bottomHighlight?: string;
  image?: string;
  imageClassName?: string;
  bgTheme?: "dark" | "light";
  layout?: "split" | "centered";
}

export default function BrandSplit({
  badge,
  title,
  description,
  bullets,
  statCard,
  bottomHighlight,
  image,
  imageClassName,
  bgTheme = "light",
  layout = "split",
}: BrandSplitProps) {
  const isDark = bgTheme === "dark";

  if (layout === "centered") {
    return (
      <section
        className={cn(
          "w-full px-4 py-12 md:px-8 md:py-[100px] lg:px-[100px]",
          isDark ? "bg-[#0D1A14]" : "bg-[#F2F7F1]"
        )}
      >
        <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-8 md:gap-[64px]">
          {/* Top: Center Text Container */}
          <div className="flex w-full max-w-[1013px] flex-col items-center gap-6 text-center md:gap-8">
            {badge && (
              <SectionBadge variant={isDark ? "dark" : "outline"} showDot>
                {badge}
              </SectionBadge>
            )}
            <div className="flex flex-col items-center gap-4">
              <h2
                className={cn(
                  "text-center font-sans text-[32px] leading-[120%] font-medium md:text-[48px] md:leading-[58px]",
                  isDark ? "text-[#F2F7F1]" : "text-[#0D1A14]"
                )}
              >
                {title.split("\n").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              {description && (
                <div
                  className={cn(
                    "flex flex-col items-center gap-4 text-center font-sans text-[16px] leading-[24px]",
                    isDark ? "text-[#F2F7F1]/80" : "text-[#0D1A14]/70"
                  )}
                >
                  {description.split("\n\n").map((para, i) => (
                    <p key={i} className="max-w-[714px]">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Full Width Image */}
          {image && (
            <div className="relative h-[220px] w-full overflow-hidden rounded-[20px] bg-neutral-200 md:h-[630px] md:rounded-[24px]">
              <OptimizedImage
                src={image}
                alt={title}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                sizes="(max-width: 768px) 100vw, 1240px"
              />
            </div>
          )}

          {/* Bottom Callout Highlight */}
          {bottomHighlight && (
            <div className="mt-6 w-full text-center md:mt-10">
              <p className="mx-auto max-w-[900px] font-sans text-[28px] leading-[36px] font-medium text-[#A9E179] md:text-[40px] md:leading-[50px] lg:text-[48px] lg:leading-[58px]">
                {bottomHighlight}
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "w-full px-4 py-12 md:px-8 md:py-16 lg:px-[100px] lg:py-[100px]",
        isDark ? "bg-[#0D1A14]" : "bg-[#F2F7F1]"
      )}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-[129px]">
        {/* Left: Text */}
        <div className="flex w-full shrink-0 flex-col items-center gap-6 lg:max-w-[608px] lg:items-start">
          {badge && (
            <SectionBadge
              variant={isDark ? "dark" : "outline"}
              showDot
              className="mb-2"
            >
              {badge}
            </SectionBadge>
          )}
          <div className="flex flex-col gap-4">
            <h2
              className={cn(
                "text-center font-sans text-[32px] leading-[38px] font-medium md:text-[48px] md:leading-[58px] lg:text-left",
                isDark ? "text-[#A9E179]" : "text-[#0D1A14]"
              )}
            >
              {title.split("\n").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <br className="md:hidden" />}
                </span>
              ))}
            </h2>
          </div>

          {description && (
            <div
              className={cn(
                "flex flex-col gap-4 text-center font-sans text-[16px] leading-[24px] lg:text-left",
                isDark ? "text-[#F2F7F1]" : "text-[#0D1A14]/70"
              )}
            >
              {description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {/* Stat Card Highlight */}
          {statCard && (
            <div className="mt-2 flex w-full flex-col gap-2 rounded-[24px] border border-white/5 bg-[#0F3221] p-8">
              <div
                className="font-sans text-[48px] leading-none font-bold text-[#A9E179] md:text-[56px]"
                style={{ fontFamily: "var(--font-anton)" }}
              >
                {statCard.value}
              </div>
              <div className="font-sans text-[14px] leading-[22px] text-[#F2F7F1] md:text-[16px] md:leading-[24px]">
                {statCard.label}
              </div>
            </div>
          )}

          {/* Bullets List */}
          {bullets && bullets.length > 0 && (
            <ul className="mt-1 flex w-full flex-col gap-2.5">
              {bullets.map((bullet, i) => {
                const isHeader = bullet.endsWith(":");
                if (isHeader) {
                  return (
                    <li
                      key={i}
                      className={cn(
                        "mt-2 text-center font-sans text-[13px] font-bold tracking-wider uppercase lg:text-left",
                        isDark ? "text-[#A9E179]" : "text-[#195236]"
                      )}
                    >
                      {bullet}
                    </li>
                  );
                }
                return (
                  <li
                    key={i}
                    className="flex items-start justify-center gap-3 lg:justify-start"
                  >
                    <span
                      className={cn(
                        "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                        isDark ? "bg-[#A9E179]" : "bg-[#195236]"
                      )}
                    />
                    <span
                      className={cn(
                        "text-center font-sans text-[14px] leading-relaxed md:text-[15px] lg:text-left",
                        isDark ? "text-white/70" : "text-[#0D1A14]/70"
                      )}
                    >
                      {bullet}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right: Image */}
        {image && (
          <div className={cn("relative h-[220px] w-full shrink-0 overflow-hidden rounded-[20px] bg-neutral-200 lg:h-[530px] lg:max-w-[503px] lg:rounded-[24px]", imageClassName)}>
            <OptimizedImage
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 503px"
            />
          </div>
        )}

        {/* Bottom Callout Highlight */}
        {bottomHighlight && (
          <div className="mt-6 w-full text-center md:mt-10">
            <p className="mx-auto max-w-[900px] font-sans text-[28px] leading-[36px] font-medium text-[#A9E179] md:text-[40px] md:leading-[50px] lg:text-[48px] lg:leading-[58px]">
              {bottomHighlight}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
