"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { newsData as staticNewsData, NewsArticle } from "@/data/sections-data";
import Link from "next/link";
import { ApiNewsArticle } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";
import { formatDate } from "@/lib/news-mapper";

const CARD_WIDTH = 361;
const CARD_GAP = 25;
const CARD_SLOT_WIDTH = CARD_WIDTH + CARD_GAP;

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard = memo(function NewsCard({ article }: NewsCardProps) {
  const startX = useRef(0);
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block shrink-0 snap-center"
      onMouseDown={(e) => {
        startX.current = e.clientX;
      }}
      onClick={(e) => {
        // Prevent navigation if the user was dragging/scrolling
        if (Math.abs(e.clientX - startX.current) > 5) {
          e.preventDefault();
        }
      }}
    >
      <article className="bg-brand-neutral-light flex h-auto w-[358px] flex-col overflow-hidden rounded-[24px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md xl:h-[488px] xl:w-[361px]">
        <div className="relative h-[264px] w-full overflow-hidden rounded-[24px] bg-neutral-100">
          <OptimizedImage
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width: 1280px) 330px, 361px"
            quality={50}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 pt-6 pb-8">
          <div className="flex items-center gap-4">
            <span className="font-inter text-brand-dark/70 text-[14px] leading-[21px]">
              {article.date}
            </span>
            {article.category && (
              <>
                <span className="text-brand-dark/70 text-sm">•</span>
                <div className="border-brand-border bg-brand-bg text-brand-active inline-flex items-center justify-center rounded-[8px] border px-4 py-1 text-[14px] leading-[21px]">
                  {article.category}
                </div>
              </>
            )}
          </div>
          <h3 className="text-brand-dark line-clamp-3 font-sans text-[24px] leading-[29px] font-medium">
            {article.title}
          </h3>
        </div>
      </article>
    </Link>
  );
});

export interface NewsSectionProps {
  apiData?: ApiNewsArticle[];
}

export default function NewsSection({ apiData }: NewsSectionProps) {
  const newsData = {
    badge: staticNewsData.badge,
    title: staticNewsData.title,
    items: Array.isArray(apiData)
      ? apiData.map((a) => ({
          id: a.id,
          slug: a.slug || a.article_slug || `article-${a.id}`,
          category: a.category || "General",
          date:
            a.display_date ||
            formatDate(a.published_at || a.publish_date || a.created_at),
          title: a.title,
          image: resolveImageUrl(a.featured_image || a.image_url),
        }))
      : [],
  };

  if (!newsData.items || newsData.items.length === 0) {
    return null;
  }
  const [activeIdx, setActiveIdx] = useState(0);
  const maxIdx = Math.max(0, newsData.items.length - 2);

  const isPausedRef = useRef(false);

  useEffect(() => {
    if (maxIdx <= 0) return;
    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [maxIdx]);

  const resetTimer = useCallback(() => {}, []);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => Math.max(0, prev - 1));
    resetTimer();
  }, [resetTimer]);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => Math.min(maxIdx, prev + 1));
    resetTimer();
  }, [maxIdx, resetTimer]);

  const handleMouseEnter = useCallback(() => {
    isPausedRef.current = true;
  }, []);
  const handleMouseLeave = useCallback(() => {
    isPausedRef.current = false;
    resetTimer(); // give a fresh 4s after hover
  }, [resetTimer]);

  return (
    <section className="bg-brand-bg w-full py-10 xl:py-[100px]" id="news">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[100px]">
        <div className="flex flex-col xl:flex-row xl:gap-[64px]">
          <div className="mb-8 flex w-full shrink-0 flex-col items-start justify-between gap-8 xl:mb-0 xl:h-[319px] xl:w-[429px]">
            <div className="flex w-full flex-col items-start gap-4">
              <SectionBadge
                variant="outline"
                showDot
                className="h-[30px] gap-[8px] px-4 text-[12px] leading-[18px] xl:h-[33px] xl:gap-[8px] xl:text-[14px] xl:leading-[21px]"
              >
                {newsData.badge}
              </SectionBadge>
              <h2
                className="text-brand-dark max-w-[466px] text-[32px] leading-[38px] font-medium xl:text-[48px] xl:leading-[58px]"
                style={{
                  fontFamily: "var(--font-inter-tight)",
                  fontWeight: 500,
                }}
              >
                {newsData.title}
              </h2>
            </div>

            <div className="hidden gap-4 xl:flex">
              <button
                onClick={handlePrev}
                disabled={activeIdx === 0}
                aria-label="Previous articles"
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${activeIdx === 0 ? "border-brand-border text-brand-dark/30 cursor-not-allowed bg-transparent" : "border-brand-border text-brand-dark hover:bg-brand-active hover:border-brand-active hover:text-white"}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={activeIdx === maxIdx}
                aria-label="Next articles"
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${activeIdx === maxIdx ? "border-brand-border text-brand-dark/30 cursor-not-allowed bg-transparent" : "border-brand-border text-brand-dark hover:bg-brand-active hover:border-brand-active hover:text-white"}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative h-auto w-full overflow-hidden xl:h-[488px] xl:w-[748px]">
            <div className="from-brand-bg pointer-events-none absolute top-0 -right-1 z-20 h-full w-[70px] bg-gradient-to-l to-transparent md:w-[120px] xl:block" />

            {/* Desktop slider */}
            <div
              className="hidden h-full w-full overflow-hidden xl:block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="flex gap-[25px] transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                style={{
                  transform: `translateX(-${activeIdx * CARD_SLOT_WIDTH}px)`,
                }}
              >
                {newsData.items.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Mobile/Tablet swipe */}
            <div
              className="block w-full snap-x snap-mandatory scrollbar-none overflow-x-auto pb-4 xl:hidden"
            >
              <div className="flex gap-4 pr-8">
                {newsData.items.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
