import Link from "next/link";
import NextImage from "next/image";
import OptimizedImage from "@/components/ui/OptimizedImage";
import type { Metadata } from "next";
import type { NewsArticle } from "@/data/news-data";
import JoinTeamSection from "@/components/sections/JoinTeamSection";
import ShareButton from "@/components/ShareButton";
import ShareBar from "@/components/ShareBar";
import NewsTOC from "@/components/NewsTOC";
import NewsCard from "@/components/NewsCard";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { newsApi, getPageMetadata } from "@/lib/api";
import { mapApiArticleToNewsArticle } from "@/lib/news-mapper";


// ---------------------------------------------------------------------------
// Route-level constants — single source of truth for every hardcoded value.
// ---------------------------------------------------------------------------
const SITE_NAME = "Malik Seeds";
const RELATED_ARTICLE_COUNT = 3;

/** Fallback author shown when an article has no explicit author field. */
const DEFAULT_AUTHOR: NonNullable<NewsArticle["author"]> = {
  name: "Md. Rafiqul Islam",
  role: "Supply Chain Manager",
  avatar: "/images/news/rafiqul-islam.png",
};

// ---------------------------------------------------------------------------
// Static asset paths
// ---------------------------------------------------------------------------
const ASSETS = {
  backArrow: "/images/news/arrow-right_up.svg",
  shareIcons: "/images/news/share-icons.svg",
  prevArrow: "/images/news/prev-arrow.svg",
  nextArrow: "/images/news/next-arrow.svg",
} as const;

// ---------------------------------------------------------------------------
import { formatRichTextWithHeadings } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Route exports
// ---------------------------------------------------------------------------

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** Generates params from the API only — no static fallback. */
export async function generateStaticParams() {
  try {
    const apiData = await newsApi.getNews();
    if (apiData?.articles?.length) {
      return apiData.articles.map((article) => ({
        slug: article.slug || article.article_slug || `article-${article.id}`,
      }));
    }
  } catch (err) {
    console.error("Failed to generate static params from API:", err);
  }
  return [];
}

/** Dynamic per-article SEO metadata — API only. */
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  let fallback: Metadata = { title: `Article Not Found - ${SITE_NAME}` };

  try {
    const found = await newsApi.getArticleBySlug(slug, { revalidate: 10, tags: ["news"] });
    if (found) {
      fallback = {
        title: `${found.title} - ${SITE_NAME}`,
        description: found.excerpt,
      };
    }
  } catch (err) {
    console.error("Failed to fetch article metadata from API:", err);
  }

  return getPageMetadata(`/news/${slug}`, fallback, { revalidate: 10, tags: ["news", "seo"] });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let article: NewsArticle | null = null;
  let allArticles: NewsArticle[] = [];

  try {
    const [apiArticle, apiData] = await Promise.all([
      newsApi.getArticleBySlug(slug, { revalidate: 10, tags: ["news"] }).catch((err) => {
        console.error("Failed to fetch single article by slug:", err);
        return null;
      }),
      newsApi.getNews({ revalidate: 10, tags: ["news"] }).catch((err) => {
        console.error("Failed to fetch all articles for navigation:", err);
        return null;
      }),
    ]);

    if (apiArticle) {
      article = mapApiArticleToNewsArticle(apiArticle);
    }

    if (apiData?.articles) {
      allArticles = apiData.articles.map(mapApiArticleToNewsArticle);
      if (!article) {
        article = allArticles.find((a) => a.slug === slug) ?? null;
      }
    }
  } catch (err) {
    console.error("Failed to fetch article details from API:", err);
  }
  // ── No data from backend → show a friendly "not found" page ──────────────
  if (!article) {
    return (
      <div className="bg-brand-bg flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <SectionBadge variant="outline" showDot>
          ARTICLE NOT FOUND
        </SectionBadge>
        <h1 className="font-heading text-brand-dark text-[28px] leading-[34px] font-medium md:text-[40px] md:leading-[50px]">
          No article data available
        </h1>
        <p className="text-brand-dark/60 max-w-[480px] text-base leading-7">
          We couldn&apos;t load this article right now. It may have been removed
          or the content is not yet available from our server.
        </p>
        <Link
          href="/news"
          className="bg-brand-active text-white font-heading inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
        >
          ← Back to News
        </Link>
      </div>
    );
  }

  const { headings, html: parsedHtml } = formatRichTextWithHeadings(
    article.contentHtml,
    { mode: "news" }
  );
  const author = article.author ?? DEFAULT_AUTHOR;

  // Circular prev/next navigation
  const currentIndex = allArticles.findIndex((a) => a.slug === article!.slug);
  const lastIndex = allArticles.length - 1;
  const prevArticle = allArticles[currentIndex - 1] ?? allArticles[lastIndex];
  const nextArticle = allArticles[currentIndex + 1] ?? allArticles[0];

  // Related articles: same category, exclude current, cap at 3
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article!.slug && a.category === article!.category)
    .slice(0, RELATED_ARTICLE_COUNT);

  return (
    <div className="bg-brand-bg min-h-screen">
      {/* ── Article wrapper ─────────────────────────────────────────── */}
      <article className="w-full px-4 pt-[100px] pb-10 md:px-12 md:pt-[130px] md:pb-20 lg:px-16 lg:pt-[180px] lg:pb-[100px] xl:px-[100px]">
        <div className="mx-auto max-w-[1030px]">
          {/* ── Header: back link + meta + share ──────────────────── */}
          <div className="flex flex-col gap-8">
            {/* Back button */}
            <Link
              href="/news"
              className="font-heading group inline-flex items-center gap-2 text-base leading-6 font-medium text-[#0B3124] focus-visible:outline-none"
            >
              <NextImage
                src={ASSETS.backArrow}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span>Back to News</span>
            </Link>

            {/* Meta block */}
            <div className="flex flex-col gap-6">
              {/* Category pill + date */}
              <div className="flex items-center gap-4">
                <div className="border-brand-border-light font-heading text-brand-active inline-flex h-12 items-center justify-center rounded-[10px] border bg-white px-6 text-base leading-6 font-medium">
                  {article.category}
                </div>
                <span
                  className="bg-brand-dark h-1 w-1 rounded-full"
                  aria-hidden="true"
                />
                <span className="font-heading text-brand-dark text-base leading-6 font-medium">
                  {article.date}
                </span>
              </div>

              {/* Article title */}
              <h1 className="font-heading text-[28px] leading-[34px] font-medium text-[#141C24] md:text-[48px] md:leading-[58px]">
                {article.title}
              </h1>

              {/* Share bar */}
              <div className="flex items-center gap-4">
                <ShareButton />
                <ShareBar title={article.title} />
              </div>
            </div>
          </div>

          {/* ── Hero image ──────────────────────────────────────────── */}
          <div className="border-brand-border/30 relative mt-8 h-[230px] w-full overflow-hidden rounded-[20px] border bg-white md:mt-12 md:h-[598px] md:rounded-[32px]">
            <OptimizedImage
              src={article.detailImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1030px"
              className="object-cover"
            />
          </div>

          {/* ── Two-column body: content + sidebar ──────────────────── */}
          <div className="mt-12 flex flex-col lg:flex-row lg:justify-between lg:gap-10 xl:gap-[130px]">
            {/* Left: article body */}
            <div className="order-2 w-full lg:order-1 lg:max-w-[608px] lg:flex-1">
              <div
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: parsedHtml }}
              />
            </div>

            {/* Right: sticky TOC + author */}
            <div className="order-1 mb-8 w-full shrink-0 lg:sticky lg:top-[120px] lg:order-2 lg:mb-0 lg:h-fit lg:w-[292px] lg:self-start">
              <NewsTOC headings={headings} author={author} />
            </div>
          </div>

          {/* ── Divider ─────────────────────────────────────────────── */}
          <div className="bg-brand-partners-border my-12 h-px w-full" />

          {/* ── Prev / Next navigation ───────────────────────────────── */}
          {prevArticle && nextArticle && (
            <div className="flex w-full items-center justify-between gap-4 py-6">
              {/* Previous */}
              <Link
                href={`/news/${prevArticle.slug}`}
                className="group flex items-center gap-3 text-right focus-visible:outline-none"
              >
                <NavArrow direction="prev" label="Previous article" />
                <div className="flex flex-col text-right">
                  <span className="font-heading text-brand-dark text-base leading-6 font-medium">
                    Previous
                  </span>
                  <span className="font-heading text-brand-dark/70 group-hover:text-brand-active hidden text-sm transition-colors md:line-clamp-2 md:max-w-[240px]">
                    {prevArticle.title}
                  </span>
                </div>
              </Link>

              {/* Next */}
              <Link
                href={`/news/${nextArticle.slug}`}
                className="group flex items-center justify-end gap-3 text-right focus-visible:outline-none"
              >
                <div className="flex flex-col text-left">
                  <span className="font-heading text-brand-dark text-base leading-6 font-medium">
                    Next
                  </span>
                  <span className="font-heading text-brand-dark/70 group-hover:text-brand-active hidden text-sm transition-colors md:line-clamp-2 md:max-w-[240px]">
                    {nextArticle.title}
                  </span>
                </div>
                <NavArrow direction="next" label="Next article" />
              </Link>
            </div>
          )}
        </div>
      </article>

      {/* ── Related articles ─────────────────────────────────────────── */}
      {relatedArticles.length > 0 && (
        <section className="bg-brand-bg w-full py-10 md:py-[100px]">
          <div className="mx-auto max-w-[1240px] px-4">
            <div className="mb-12 flex flex-col items-center gap-4">
              <SectionBadge variant="outline" showDot>
                FROM OUR NEWSROOM
              </SectionBadge>
              <h2 className="font-heading text-brand-dark text-center text-[32px] leading-[38px] font-medium md:text-[48px] md:leading-[58px]">
                Related News &amp; Updates
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((art) => (
                <NewsCard key={art.id} article={art} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Careers CTA ─────────────────────────────────────────────── */}
      <JoinTeamSection />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Circular arrow button used in prev/next navigation. */
function NavArrow({
  direction,
  label,
}: {
  direction: "prev" | "next";
  label: string;
}) {
  return (
    <div
      aria-label={label}
      className="bg-brand-active hover:bg-brand-primary-hover flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-300 active:scale-95 md:h-10 md:w-10"
    >
      <NextImage
        src="/arrow.svg"
        alt=""
        width={16}
        height={16}
        className={`md:h-5 md:w-5 ${direction === "prev" ? "rotate-180" : ""}`}
      />
    </div>
  );
}
