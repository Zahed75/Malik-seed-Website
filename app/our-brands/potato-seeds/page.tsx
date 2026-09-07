import BrandHero from "@/components/sections/brand/BrandHero";
import BrandIntro from "@/components/sections/brand/BrandIntro";
import BrandGrid from "@/components/sections/brand/BrandGrid";
import BrandSplit from "@/components/sections/brand/BrandSplit";
import BrandCards from "@/components/sections/brand/BrandCards";
import BrandYouTube from "@/components/sections/brand/BrandYouTube";
import { potatoSeedData } from "@/data/brands/potato-seed";
import { Metadata } from "next";
import { getPageMetadata, brandsApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: potatoSeedData.meta.title,
    description: potatoSeedData.meta.description,
  };
  return getPageMetadata("/our-brands/potato-seeds", fallback, { revalidate: 15, tags: ["brands", "seo"] });
}

export default async function PotatoSeedPage() {
  let apiBrandData = null;
  try {
    apiBrandData = await brandsApi
      .getPotatoSeedData({ revalidate: 15, tags: ["brands"] })
      .catch(() => null);
  } catch (err) {
    console.error("Failed to fetch potato seed brand page content:", err);
  }

  const dynamicData = apiBrandData?.potatoSeedData;

  const resolvedHero = {
    ...potatoSeedData.hero,
    bgImage: dynamicData?.hero?.bgImage
      ? resolveImageUrl(dynamicData.hero.bgImage)
      : "",
  };

  const resolvedIntro = {
    ...potatoSeedData.intro,
    highlights: dynamicData?.intro?.highlights
      ? dynamicData.intro.highlights.filter(Boolean)
      : [],
  };

  const resolvedGrid = {
    ...potatoSeedData.grid,
    badge: dynamicData?.grid?.badge || "",
    images: dynamicData?.grid?.images && dynamicData.grid.images.length > 0
      ? dynamicData.grid.images.map((img) => resolveImageUrl(img))
      : [],
  };

  const resolvedSplit = {
    ...potatoSeedData.split,
    badge: dynamicData?.split?.badge || "",
    image: dynamicData?.split?.image
      ? resolveImageUrl(dynamicData.split.image)
      : "",
  };

  const resolvedYoutube = {
    ...potatoSeedData.youtube,
    youtubeUrl: dynamicData?.youtube?.youtubeUrl || "",
    images:
      dynamicData?.youtube?.images && dynamicData.youtube.images.length > 0
        ? dynamicData.youtube.images.map((img) => resolveImageUrl(img))
        : [],
    brandLogo: potatoSeedData.youtube.brandLogo,
    brandLogoAlt: potatoSeedData.youtube.brandLogoAlt,
  };

  return (
    <div className="min-h-screen bg-[#F2F7F1]">
      <BrandHero {...resolvedHero} />
      <BrandIntro {...resolvedIntro} />
      <BrandGrid {...resolvedGrid} />
      {resolvedSplit.image ? <BrandSplit {...resolvedSplit} imageClassName="h-[391px]" /> : null}
      <BrandCards {...potatoSeedData.cards} showIndex={false} />
      <BrandYouTube {...resolvedYoutube} />
    </div>
  );
}
