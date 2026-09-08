import OptimizedImage from "@/components/ui/OptimizedImage";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { cn } from "@/lib/utils";
import BrandCardBorder from "./BrandCardBorder";
import ActionButton, { ActionButtonVariant } from "@/components/ActionButton";

interface StepItem {
  number?: string;
  tag?: string;
  title: string;
  description: string;
}

interface BrandProcessProps {
  badge: string;
  title: string;
  description?: string;
  steps: StepItem[];
  images?: string[];
  bottomQuote?: string;
  variant?: "default" | "light" | "dark";
  layout?: "default" | "2x2";
  buttonText?: string;
  buttonLink?: string;
  buttonTarget?: string;
  buttonVariant?: ActionButtonVariant;
}

export default function BrandProcess({
  badge,
  title,
  description,
  steps,
  images,
  bottomQuote,
  variant = "default",
  layout = "default",
  buttonText,
  buttonLink,
  buttonTarget,
  buttonVariant,
}: BrandProcessProps) {
  const is2x2 = layout === "2x2";
  const stepCols =
    steps.length === 3
      ? "md:grid-cols-3"
      : steps.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="w-full bg-[#F2F7F1] px-4 py-12 md:px-8 md:py-16 lg:px-[100px] lg:py-[100px]">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-8 md:gap-16">
        {/* Header */}
        <div className="flex w-full max-w-[900px] flex-col items-center justify-center gap-6 text-center">
          <SectionBadge variant="outline" showDot>
            {badge}
          </SectionBadge>
          <div className="flex flex-col gap-2 md:gap-3">
            <h2
              className={cn(
                "font-sans text-[32px] leading-[38px] font-medium text-[#0D1A14] md:text-[48px] md:leading-[58px]",
                is2x2 && "max-w-[784px] mx-auto"
              )}
            >
              {title}
            </h2>
            {description && (
              <p
                className={cn(
                  "mx-auto mt-2 max-w-[830px] font-sans text-[15px] leading-[24px] md:text-[16px]",
                  is2x2 ? "text-[#0D1A14]" : "text-[#0D1A14]/65"
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div
            className={cn(
              "grid gap-5 md:gap-6",
              is2x2
                ? "w-full max-w-[1030px] grid-cols-1 md:grid-cols-2"
                : `grid-cols-1 ${stepCols}`
            )}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                className={cn(
                  "brand-card group relative h-full w-full",
                  is2x2
                    ? "rounded-[24px] min-h-[277px]"
                    : variant === "default"
                      ? "rounded-[20px]"
                      : "rounded-[24px]"
                )}
              >
                <div
                  className={cn(
                    "flex h-full w-full flex-col justify-between overflow-hidden rounded-[inherit] transition-all duration-300",
                    is2x2
                      ? "gap-6 rounded-[24px] bg-[#0F3221] px-8 py-10 md:px-10 md:py-12"
                      : cn(
                          "gap-6 justify-start md:gap-12",
                          variant === "light"
                            ? "border border-[#E4E7EC] bg-[#F9FAFB] p-8"
                            : variant === "dark"
                              ? "border border-white/5 bg-[#0F3221] p-8"
                              : "border border-[#0D1A14]/8 bg-white p-6 hover:shadow-md"
                        )
                  )}
                >
                  {/* Tag Badge or Number */}
                  {step.tag ? (
                    <SectionBadge variant="green" className="h-auto rounded-full border border-[#E4E7EC] py-1.5 text-[12px] leading-[18px]">
                      {step.tag}
                    </SectionBadge>
                  ) : (
                    step.number && (
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center font-sans text-[18px] font-medium leading-[22px]",
                          is2x2
                            ? "rounded-[10px] bg-[#A9E179] text-[#0D1A14]"
                            : cn(
                                "rounded-full font-[500]",
                                variant === "dark"
                                  ? "bg-[#A9E179] text-[#0D1A14]"
                                  : "bg-[#195236] text-white"
                              )
                        )}
                      >
                        {step.number}
                      </div>
                    )
                  )}
                  <div className="flex flex-col gap-2 md:gap-3">
                    <h3
                      className={cn(
                        "font-sans text-[20px] leading-[24px] font-medium md:text-[24px] md:leading-[29px]",
                        variant === "dark" || is2x2 ? "text-[#F2F7F1]" : "text-[#0D1A14]"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        "font-sans text-[16px] leading-[24px]",
                        is2x2
                          ? "text-[#F2F7F1]"
                          : variant === "dark"
                            ? "text-[#F2F7F1]/70"
                            : "text-[#0D1A14]/65"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
                <BrandCardBorder
                  isDark={variant === "dark" || is2x2}
                  strokeColor={
                    step.tag
                      ? "#a9e179"
                      : variant === "dark" || is2x2
                        ? "#a9e179"
                        : "#195236"
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom Quote */}
        {bottomQuote && (
          <div
            className={cn(
              "flex w-full items-center",
              is2x2
                ? "max-w-[824px] mx-auto gap-6 md:gap-8 pt-4 md:pt-6 justify-start"
                : cn(
                    "justify-center gap-4 pt-4 lg:justify-start",
                    variant === "dark"
                      ? "gap-6 border-none pt-0 md:gap-8"
                      : "border-t border-[#0D1A14]/10"
                  )
            )}
          >
            <div
              className={cn(
                "shrink-0 rounded-[10px]",
                is2x2
                  ? "h-[40px] w-[3px] bg-[#0D1A14]"
                  : cn(
                      "h-[54px] w-[2px]",
                      variant === "dark" ? "bg-[#0D1A14]" : "bg-[#195236]"
                    )
              )}
            />
            <p
              className={cn(
                "font-sans font-medium",
                is2x2
                  ? "text-[22px] leading-[28px] italic text-[#0F3221] md:text-[32px] md:leading-[38px]"
                  : variant === "dark"
                    ? "text-[24px] leading-[29px] text-[#0F3221] md:text-[32px] md:leading-[38px]"
                    : "text-[18px] text-[#0D1A14] md:text-[22px]"
              )}
            >
              {bottomQuote}
            </p>
          </div>
        )}

        {/* Optional Image Grid */}
        {images && images.length > 0 && (
          <div
            className="flex w-full snap-x snap-mandatory scrollbar-none gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-6 md:pb-0"
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative h-[260px] w-[290px] shrink-0 snap-start overflow-hidden rounded-[24px] bg-neutral-200 sm:h-[350px] sm:w-[400px] md:h-[377px] md:w-full"
              >
                <OptimizedImage
                  src={img}
                  alt={`Process detail ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 608px"
                />
              </div>
            ))}
          </div>
        )}

        {/* Optional Action Button */}
        {buttonText && buttonLink && (
          <div className="flex w-full justify-center mt-2 md:mt-4">
            {(() => {
              const isValidLink = Boolean(
                buttonLink &&
                  buttonLink.trim() !== "" &&
                  buttonLink !== "/" &&
                  buttonLink !== "#" &&
                  buttonLink !== "/coming-soon"
              );
              const resolvedHref = isValidLink ? buttonLink : "/coming-soon";
              const resolvedTarget = isValidLink
                ? (buttonTarget || (buttonLink.startsWith("/") ? "_self" : "_blank"))
                : "_self";
              const resolvedRel = resolvedTarget === "_blank" ? "noopener noreferrer" : undefined;

              return (
                <ActionButton
                  href={resolvedHref}
                  label={buttonText}
                  variant={buttonVariant || (variant === "dark" ? "primary" : "dark")}
                  className="h-[46px] gap-[8px] px-4 text-[14px] leading-[17px] md:gap-3 md:px-[24px] md:text-[16px] md:leading-[19px]"
                  showArrow={true}
                  target={resolvedTarget}
                  rel={resolvedRel}
                />
              );
            })()}
          </div>
        )}
      </div>
    </section>
  );
}
