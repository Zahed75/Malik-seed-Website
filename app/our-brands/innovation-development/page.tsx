import BrandHero from "@/components/sections/brand/BrandHero";
import BrandIntro from "@/components/sections/brand/BrandIntro";
import BrandSplit from "@/components/sections/brand/BrandSplit";
import BrandGrid from "@/components/sections/brand/BrandGrid";
import BrandCards from "@/components/sections/brand/BrandCards";
import BrandProjectsTable from "@/components/sections/brand/BrandProjectsTable";
import { innovationDevelopmentData } from "@/data/brands/innovation-development";
import { Metadata } from "next";
import { getPageMetadata, brandsApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: innovationDevelopmentData.meta.title,
    description: innovationDevelopmentData.meta.description,
  };
  return getPageMetadata("/our-brands/innovation-development", fallback, { revalidate: 15, tags: ["brands", "seo"] });
}

export default async function InnovationDevelopmentPage() {
  let apiBrandData = null;
  try {
    apiBrandData = await brandsApi
      .getInnovationDevelopmentData({ revalidate: 15, tags: ["brands"] })
      .catch(() => null);
  } catch (err) {
    console.error("Failed to fetch innovation & development brand page content:", err);
  }

  const dynamicData = apiBrandData?.innovationDevelopmentData;

  const resolvedHero = {
    ...innovationDevelopmentData.hero,
    bgImage: dynamicData?.hero?.bgImage
      ? resolveImageUrl(dynamicData.hero.bgImage)
      : "",
  };

  const resolvedIntro = {
    ...innovationDevelopmentData.intro,
    stats: dynamicData?.intro?.stats && dynamicData.intro.stats.length > 0
      ? dynamicData.intro.stats.map((s) => ({
          value: `${s.value ?? ""}${s.suffix ?? ""}`,
          label: s.label || "",
        }))
      : [],
    highlights: dynamicData?.intro?.highlights
      ? dynamicData.intro.highlights.filter(Boolean)
      : [],
  };

  const resolvedSplit1 = {
    ...innovationDevelopmentData.split1,
    badge: dynamicData?.split1?.badge || "",
    image: dynamicData?.split1?.image
      ? resolveImageUrl(dynamicData.split1.image)
      : "",
  };

  const resolvedGrid = {
    ...innovationDevelopmentData.grid,
    badge: dynamicData?.grid?.badge || "",
    images: dynamicData?.grid?.images
      ? dynamicData.grid.images.map((img) => resolveImageUrl(img))
      : [],
  };

  const resolvedSplit2 = {
    ...innovationDevelopmentData.split2,
    badge: dynamicData?.split2?.badge || "",
    image: dynamicData?.split2?.image
      ? resolveImageUrl(dynamicData.split2.image)
      : "",
  };

  const resolvedProjects = dynamicData?.Projects && dynamicData.Projects.length > 0
    ? dynamicData.Projects.map((p) => ({
        title: p.title || "",
        duration: p.duration
          ? p.duration.startsWith("(")
            ? p.duration
            : `(${p.duration})`
          : "",
        focus: p.focus || "",
        location: p.location || "",
        donor: p.donor || "",
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#F2F7F1]">
      <BrandHero {...resolvedHero} />
      <BrandIntro {...resolvedIntro} />
      <BrandSplit {...resolvedSplit1} 
      imageClassName="h-[260px]" 
      />
      <BrandGrid {...resolvedGrid} />
      <BrandCards {...innovationDevelopmentData.cards} showIndex={false} />
      <BrandProjectsTable projects={resolvedProjects} />
      <BrandSplit {...resolvedSplit2}
      imageClassName="h-[260px]" 
      />
    </div>
  );
}
