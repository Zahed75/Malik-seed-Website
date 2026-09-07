"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import ActionButton from "@/components/ActionButton";
import CountUp from "@/components/ui/CountUp";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { ApiAbout, ApiAboutStat } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

export interface AboutSectionProps {
  apiData?: ApiAbout;
}

/**
 * Parse the `stats` field which may arrive as an array or a JSON string.
 */
function parseStats(raw?: ApiAboutStat[] | string): ApiAboutStat[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Convert API stat objects into the shape the CountUp component expects.
 */
function buildStats(apiStats: ApiAboutStat[]) {
  return apiStats.map((s) => {
    const match = s.value.match(/^([^\d]*)([\d.]+)([^\d]*)$/);
    if (match) {
      return {
        prefix: match[1] || "",
        toValue: parseFloat(match[2]) || 0,
        suffix: match[3] || "",
        label: s.label,
      };
    }
    return {
      prefix: "",
      toValue: parseFloat(s.value) || 0,
      suffix: "",
      label: s.label,
    };
  });
}

/**
 * Build the merged about data from the API response, falling back to static
 * data for any missing fields.
 */
function buildAboutData(apiData?: ApiAbout) {
  if (!apiData) {
    return {
      badge: "",
      introDesktopText: "",
      introMobileText: "",
      cta: {
        label: "",
        href: "",
      },
      stats: [],
      images: {
        teamBanner: "",
        about1: "",
        about2: "",
        about1Mobile: "",
        about2Mobile: "",
      },
    };
  }

  const statsArray = parseStats(apiData.stats);
  const parsedStats = buildStats(statsArray);

  const desc = apiData.description || "";
  const teamBanner = resolveImageUrl(apiData.image_url);

  const gallery = apiData.gallery_images ?? [];
  const about1 = gallery[0] ? resolveImageUrl(gallery[0]) : "";
  const about2 = gallery[1] ? resolveImageUrl(gallery[1]) : "";

  const introMobileText =
    desc.length > 158 ? desc.substring(0, 158) + "..." : desc;

  return {
    badge: apiData.title || "",
    introDesktopText: desc,
    introMobileText,
    cta: {
      label: apiData.cta_text || "",
      href: apiData.cta_link || "",
    },
    stats: parsedStats,
    images: {
      teamBanner,
      about1,
      about2,
      about1Mobile: gallery[0] ? resolveImageUrl(gallery[0]) : "",
      about2Mobile: gallery[1] ? resolveImageUrl(gallery[1]) : "",
    },
  };
}

// ---------------------------------------------------------------------------
// Typing text block — shared between desktop and mobile
// ---------------------------------------------------------------------------
interface TypingTextProps {
  text: string;
  className?: string;
}

function TypingText({ text, className = "" }: TypingTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [displayedCount, setDisplayedCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start revealing when the top of the text enters the bottom 85% of viewport
      const start = viewportHeight * 0.85;
      // Complete the reveal when the top of the text reaches the top 25% of viewport
      const end = viewportHeight * 0.25;

      let progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));

      const count = Math.floor(progress * text.length);
      setDisplayedCount(count);
    };

    // Run initial calculation
    handleScroll();

    // Use IntersectionObserver to optimize performance, only listening to scroll when component is near
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", handleScroll, { passive: true });
          window.addEventListener("resize", handleScroll, { passive: true });
          handleScroll();
        } else {
          window.removeEventListener("scroll", handleScroll);
          window.removeEventListener("resize", handleScroll);
        }
      },
      { rootMargin: "150px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [text]);

  return (
    <p ref={ref} aria-label={text} className={className}>
      {/*
        Each character lives in its own <span> so the browser always
        lays out the FULL text — word-wrapping never shifts as typing
        progresses. Only the color changes per character.
      */}
      {text.split("").map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`transition-colors duration-200 ${
            i < displayedCount ? "text-brand-dark" : "text-brand-dark/20"
          }`}
        >
          {char}
        </span>
      ))}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AboutSection({ apiData }: AboutSectionProps) {
  if (!apiData) return null;

  const aboutData = buildAboutData(apiData);

  return (
    <section className="bg-brand-bg w-full" id="about">
      <div className="mx-auto max-w-[1440px]">
        {/* ===== Desktop Layout ===== */}
        {/* Frame 23 — 1240x591, left:100px, top:100px */}
        <div className="hidden flex-row items-start gap-8 px-6 py-12 md:flex lg:gap-16 lg:px-16 lg:py-20 xl:gap-[129px] xl:px-[100px] xl:pt-[100px] xl:pb-0">
          {/* Left — Frame 22: 608x591, col, gap 32 */}
          <div className="flex max-w-[608px] flex-1 flex-col gap-6 lg:gap-8 xl:gap-[32px]">
            {/* Section badge — Figma "About Malik Seeds" */}
            <SectionBadge variant="green">{aboutData.badge}</SectionBadge>

            {/* Frame 2147229506 — 608x526, col, gap 48 */}
            <div className="flex flex-col gap-8 lg:gap-12 xl:gap-[48px]">
              {/* Typing text — desktop */}
              <TypingText
                text={aboutData.introDesktopText}
                className="text-body-intro"
              />

              {/* Frame 6 CTA — 159x46, bg #195236, radius 60px */}
              <ActionButton
                href={aboutData.cta.href}
                label={aboutData.cta.label}
                variant="dark"
                className="h-[46px] w-[159px] px-0"
                iconSize={20}
              />
            </div>
          </div>

          {/* Right — Frame 37: 503x582, left:737px, col, gap 16 */}
          <div className="flex w-[320px] shrink-0 flex-col gap-[16px] sm:w-[400px] lg:w-[440px] xl:w-[503px]">
            {/* Frame 32 — 503x340, bg-[#F9FAFB], radius 24px */}
            <div className="bg-brand-neutral-light group relative aspect-[503/340] w-full overflow-hidden rounded-[16px] xl:rounded-[24px]">
              <OptimizedImage
                src={aboutData.images.teamBanner}
                alt="Malik Seeds Team"
                fill
                sizes="(max-width: 768px) 358px, (max-width: 1200px) 440px, 503px"
                quality={50}
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            {/* Frame 35 — 503x226, gap 16 */}
            <div className="flex w-full flex-row gap-[16px]">
              {/* Frame 33 — 243x226 */}
              <div className="group relative aspect-[243/226] flex-1 overflow-hidden rounded-[16px] xl:rounded-[24px]">
                <OptimizedImage
                  src={aboutData.images.about1}
                  alt="Years of Experience"
                  fill
                  sizes="(max-width: 1200px) 200px, 243px"
                  quality={50}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              {/* Frame 34 — 243x226 */}
              <div className="group relative aspect-[243/226] flex-1 overflow-hidden rounded-[16px] xl:rounded-[24px]">
                <OptimizedImage
                  src={aboutData.images.about2}
                  alt="Farmer Partners"
                  fill
                  sizes="(max-width: 1200px) 200px, 243px"
                  quality={50}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Stats row — Frame 2147229657: 1240x178 */}
        <div className="hidden px-[24px] pt-[40px] pb-[40px] md:block md:px-6 md:pt-[50px] md:pb-[60px] lg:px-16 xl:px-[100px] xl:pt-[60px] xl:pb-[100px]">
          <div className="flex w-full flex-row items-center justify-between rounded-[16px]">
            {aboutData.stats.map((stat, index) => (
              <Fragment key={stat.label}>
                <div className="flex h-[140px] max-w-[235px] flex-1 flex-col items-center justify-center text-center lg:h-[160px] xl:h-[178px]">
                  <span className="text-stat-number-desktop text-brand-active">
                    {stat.prefix}
                    <CountUp to={stat.toValue} />
                    {stat.suffix}
                  </span>
                  <span className="font-inter text-brand-dark max-w-[192px] text-center text-[12px] leading-[18px] lg:text-[14px] lg:leading-[21px] xl:text-[16px] xl:leading-[24px]">
                    {stat.label}
                  </span>
                </div>
                {index < aboutData.stats.length - 1 && (
                  <div className="bg-brand-partners-border h-[60px] w-[1px] shrink-0 lg:h-[72px] xl:h-[86px]" />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* ===== Mobile Layout ===== */}
        {/* Frame: 390x1542, padding 40px 0, col, gap 32 */}
        <div className="flex flex-col gap-[32px] py-[40px] md:hidden">
          {/* Frame 23 — 390x1023, padding 0 16, col, gap 48 */}
          <div className="flex flex-col gap-[48px] px-[16px]">
            {/* Frame 22 — 358x559, col, gap 24, items-center */}
            <div className="flex flex-col items-center gap-[24px]">
              {/* Badge — Figma "About Malik Seeds" */}
              <SectionBadge variant="green">{aboutData.badge}</SectionBadge>

              {/* Main text + CTA */}
              <div className="flex flex-col items-center gap-[32px]">
                {/* Typing text — mobile */}
                <TypingText
                  text={aboutData.introMobileText}
                  className="text-brand-dark text-center font-sans text-[24px] leading-[36px] font-medium"
                />

                {/* CTA — 123x41, bg #195236, radius 60px */}
                <ActionButton
                  href={aboutData.cta.href}
                  label={aboutData.cta.label}
                  variant="dark"
                  className="h-[41px] w-[123px] gap-[6px] px-0 text-[14px]"
                  iconSize={16}
                />
              </div>
            </div>

            {/* Frame 37 — 358x416, col, gap 16 */}
            <div className="flex flex-col gap-[16px]">
              {/* Frame 32 — 358x240, bg #F9FAFB, radius 16px */}
              <div className="bg-brand-neutral-light relative h-[240px] w-full overflow-hidden rounded-[16px]">
                <OptimizedImage
                  src={aboutData.images.teamBanner}
                  alt="Malik Seeds Team"
                  fill
                  sizes="358px"
                  quality={50}
                  className="object-cover"
                />
              </div>

              {/* Frame 35 — 358x160, gap 16 */}
              <div className="flex flex-row gap-4">
                {/* Frame 33 — 171x160 */}
                <div className="relative h-40 flex-1 rounded-[16px] overflow-hidden">
                  <OptimizedImage
                    src={aboutData.images.about1Mobile}
                    alt="Years of Experience"
                    fill
                    sizes="171px"
                    quality={50}
                    className="object-cover"
                  />
                </div>
                {/* Frame 34 — 171x160 */}
                <div className="relative h-40 flex-1 rounded-[16px] overflow-hidden">
                  <OptimizedImage
                    src={aboutData.images.about2Mobile}
                    alt="Farmer Partners"
                    fill
                    sizes="171px"
                    quality={50}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats — Frame 2147229657: 390x407, padding 0 16, col, gap 8 */}
          <div className="flex flex-col items-center gap-[8px] px-[16px]">
            {[
              [aboutData.stats[0], aboutData.stats[1]],
              [aboutData.stats[2], aboutData.stats[3]],
              [aboutData.stats[4]],
            ].map((row, rowIndex) => {
              const validRow = row.filter(Boolean);
              if (validRow.length === 0) return null;
              return (
                <Fragment key={rowIndex}>
                  {rowIndex > 0 && (
                    <div className="bg-brand-partners-border h-[1px] w-[72px]" />
                  )}
                  <div className="flex w-full flex-row gap-[16px]">
                    {validRow.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex h-[125px] flex-1 flex-col items-center justify-center gap-[8px] rounded-[24px] px-3"
                      >
                        <span className="text-stat-number text-brand-active">
                          {stat.prefix}
                          <CountUp to={stat.toValue} />
                          {stat.suffix}
                        </span>
                        <span className="font-inter text-brand-dark text-center text-[14px] leading-[21px]">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
