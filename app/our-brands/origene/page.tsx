import BrandHero from "@/components/sections/brand/BrandHero";
import BrandIntro from "@/components/sections/brand/BrandIntro";
import BrandGrid from "@/components/sections/brand/BrandGrid";
import BrandSplit from "@/components/sections/brand/BrandSplit";
import BrandProcess from "@/components/sections/brand/BrandProcess";
import { origeneData } from "@/data/brands/origene";
import { Metadata } from "next";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { getPageMetadata, brandsApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: origeneData.meta.title,
    description: origeneData.meta.description,
  };
  return getPageMetadata("/our-brands/origene", fallback, { revalidate: 15, tags: ["brands", "seo"] });
}

export default async function OrigenePage() {
  let apiBrandData = null;
  try {
    apiBrandData = await brandsApi
      .getOrigeneData({ revalidate: 15, tags: ["brands"] })
      .catch(() => null);
  } catch (err) {
    console.error("Failed to fetch origene brand page content:", err);
  }

  const dynamicData = apiBrandData?.origeneData || apiBrandData;

  const resolvedHero = {
    ...origeneData.hero,
    bgImage: dynamicData?.hero?.bgImage
      ? resolveImageUrl(dynamicData.hero.bgImage)
      : "",
  };

  const resolvedGrid = {
    ...origeneData.grid,
    badge: dynamicData?.grid?.badge || "",
    images:
      dynamicData?.grid?.images && dynamicData.grid.images.length > 0
        ? dynamicData.grid.images.map((img) => resolveImageUrl(img))
        : [],
  };

  const resolvedSplit1 = {
    ...origeneData.split1,
    badge: dynamicData?.split1?.badge || "",
    image: dynamicData?.split1?.image
      ? resolveImageUrl(dynamicData.split1.image)
      : "",
  };

  const resolvedProcess2 = {
    ...origeneData.process2,
    badge: dynamicData?.process2?.badge || "",
    images:
      dynamicData?.process2?.images && dynamicData.process2.images.length > 0
        ? dynamicData.process2.images.map((img) => resolveImageUrl(img))
        : [],
    buttonText: dynamicData?.process2?.buttonText || "",
    buttonLink: dynamicData?.process2?.buttonLink || "",
  };

  return (
    <div className="min-h-screen bg-[#F2F7F1]">
      <BrandHero {...resolvedHero} />
      <BrandIntro {...origeneData.intro} />
      <BrandGrid {...resolvedGrid} />

      {/* THE PROBLEM WE'RE SOLVING */}
      <section className="w-full bg-[#0D1A14] px-4 py-12 md:px-8 md:py-16 lg:px-25 lg:py-25">
        <div className="mx-auto flex max-w-310 flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-14">
          {/* Left Column: Text + Stat Card */}
          <div className="flex w-full shrink-0 flex-col items-start justify-between gap-8 lg:h-178.5 lg:max-w-xl lg:gap-0">
            {/* Badge */}
            {resolvedSplit1.badge ? (
              <SectionBadge variant="dark" showDot className="mb-2">
                {resolvedSplit1.badge}
              </SectionBadge>
            ) : null}

            {/* Title */}
            <div className="flex flex-col gap-4">
              <h2 className="text-left font-sans text-[32px] leading-9.5 font-medium whitespace-pre-line text-white md:text-[48px] md:leading-14.5">
                {origeneData.split1.title.map((part, i) => {
                  if (part.includes("\n")) {
                    return (
                      <span key={i} className="text-[#A9E179]">
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </h2>
            </div>

            {/* Stat Card Highlight */}
            <div className="mt-2 flex w-full flex-col gap-2 rounded-[24px] border border-white/5 bg-[#0F3221] p-8 md:p-12">
              <div
                className="font-sans text-[48px] leading-[120%] font-bold tracking-[4px] text-[#A9E179] md:text-[56px]"
                style={{ fontFamily: "var(--font-anton)" }}
              >
                {origeneData.split1.statCard.value}
              </div>
              <div className="font-sans text-[14px] leading-5.5 text-[#F2F7F1]/90 md:text-[16px] md:leading-6">
                {origeneData.split1.statCard.label}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-4 text-left font-sans text-[16px] leading-6 text-[#F2F7F1]/70">
              {origeneData.split1.description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Right Column: Image */}
          {resolvedSplit1.image ? (
            <div className="relative mx-auto aspect-square w-full max-w-[363px] shrink-0 overflow-hidden rounded-[20px] bg-neutral-200 md:max-w-none lg:mx-0 lg:aspect-auto lg:h-178.5 lg:max-w-152 lg:rounded-[24px]">
              <OptimizedImage
                src={resolvedSplit1.image}
                alt={origeneData.split1.title.join(" ").replace(/\n/g, "")}
                fill
                className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 608px"
                priority
              />
            </div>
          ) : null}
        </div>
      </section>

      <BrandProcess {...origeneData.process1} variant="dark" layout="2x2" />
      <BrandProcess {...resolvedProcess2} variant="default" />
      <BrandSplit
        {...origeneData.split2}
        bgTheme="dark"
        layout="centered"
        image={undefined}
      />
    </div>
  );
}
