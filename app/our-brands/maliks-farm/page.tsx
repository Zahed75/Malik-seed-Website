import OptimizedImage from "@/components/ui/OptimizedImage";
import BrandHero from "@/components/sections/brand/BrandHero";
import BrandIntro from "@/components/sections/brand/BrandIntro";
import BrandTraining from "@/components/sections/brand/BrandTraining";
import BrandCropPortfolio from "@/components/sections/brand/BrandCropPortfolio";
import { maliksFarmData } from "@/data/brands/maliks-farm";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { Metadata } from "next";
import { getPageMetadata, brandsApi, contactApi } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: maliksFarmData.meta.title,
    description: maliksFarmData.meta.description,
  };
  return getPageMetadata("/our-brands/maliks-farm", fallback, { revalidate: 15, tags: ["brands", "seo"] });
}

export default async function MaliksFarmPage() {
  let apiBrandData = null;
  let contactInfo = null;

  try {
    const [brandRes, contactRes] = await Promise.all([
      brandsApi.getMaliksFarmData({ revalidate: 15, tags: ["brands"] }).catch(() => null),
      contactApi.getContact().catch(() => null),
    ]);
    apiBrandData = brandRes;
    contactInfo = contactRes;
    console.log("Fetched maliks farm brand page content:", apiBrandData);
  } catch (err) {
    console.error("Failed to fetch maliks farm brand page content:", err);
  }

  const dynamicData = apiBrandData?.maliksFarmData || apiBrandData;

  const resolvedHero = {
    ...maliksFarmData.hero,
    bgImage: dynamicData?.hero?.bgImage
      ? resolveImageUrl(dynamicData.hero.bgImage)
      : "",
  };

  const resolvedIntro = {
    ...maliksFarmData.intro,
    stats: dynamicData?.intro?.stats && dynamicData.intro.stats.length > 0
      ? dynamicData.intro.stats.map((s) => ({
          value: `${s.value ?? ""}${s.suffix ?? ""}`,
          label: s.label || "",
        }))
      : [],
  };

  const resolvedSplit1 = {
    ...maliksFarmData.split1,
    badge: dynamicData?.split1?.badge || "",
    image: dynamicData?.split1?.image
      ? resolveImageUrl(dynamicData.split1.image)
      : "",
  };

  const resolvedProcess = {
    ...maliksFarmData.process,
    badge: dynamicData?.process?.badge || "",
    images: dynamicData?.process?.images && dynamicData.process.images.length > 0
      ? dynamicData.process.images.map((img) => resolveImageUrl(img))
      : [],
  };

  const resolvedSplit2 = {
    ...maliksFarmData.split2,
    badge: dynamicData?.split2?.badge || "",
    images: dynamicData?.split2?.images && dynamicData.split2.images.filter(Boolean).length > 0
      ? dynamicData.split2.images.filter(Boolean).map((img) => resolveImageUrl(img))
      : dynamicData?.split2?.image
      ? [resolveImageUrl(dynamicData.split2.image)]
      : [],
    gallery: dynamicData?.split2?.gallery && dynamicData.split2.gallery.length > 0
      ? dynamicData.split2.gallery.map((img) => resolveImageUrl(img))
      : [],
  };

  const resolvedTraining = {
    badge: dynamicData?.training?.badge || "",
    programs: dynamicData?.training?.programs && dynamicData.training.programs.length > 0
      ? dynamicData.training.programs.map((p, idx) => ({
          id: p.id || `program-${idx}`,
          title: p.title || "",
          image: p.image ? resolveImageUrl(p.image) : "",
        }))
      : [],
    facilities: dynamicData?.training?.facilities && dynamicData.training.facilities.length > 0
      ? dynamicData.training.facilities.map((f) => ({
          title: f.title || "",
          description: f.description || "",
          image: f.image ? resolveImageUrl(f.image) : "",
        }))
      : [],
  };

  // Extract visitor scans images from dynamic API data ({ image: string[] } or array) or fallback
  const rawVisitorScans = dynamicData?.testimonials?.visitorScans;
  let rawScanImages: string[] = [];

  if (rawVisitorScans) {
    if (Array.isArray(rawVisitorScans)) {
      rawScanImages = rawVisitorScans
        .map((s: any) => (typeof s === "string" ? s : s?.image || s?.img || ""))
        .filter(Boolean);
    } else if (typeof rawVisitorScans === "object") {
      const imgArray = (rawVisitorScans as any).image || (rawVisitorScans as any).images || [];
      if (Array.isArray(imgArray)) {
        rawScanImages = imgArray.filter(Boolean);
      }
    }
  }

  // Also check dynamicData?.testimonials?.images
  if (rawScanImages.length === 0 && Array.isArray(dynamicData?.testimonials?.images)) {
    rawScanImages = dynamicData.testimonials.images.filter(Boolean);
  }

  const resolvedTestimonials = {
    badge: dynamicData?.testimonials?.badge || "",
    title: dynamicData?.testimonials?.title || "",
    images: rawScanImages.map((img) => resolveImageUrl(img)),
    visitorScans:
      rawScanImages.length > 0
        ? rawScanImages.map((img, idx) => ({
            image: resolveImageUrl(img),
            title: `Visitor Log Entry ${idx + 1}`,
          }))
        : [],
  };
  

  // Convert split2 tags object to CropGroup[] layout for BrandCropPortfolio
  const rawTags = dynamicData?.split2?.tags || (dynamicData as any)?.cropPortfolio?.tags || null;
  let resolvedGroups = undefined;
  if (rawTags && typeof rawTags === "object" && !Array.isArray(rawTags)) {
    resolvedGroups = Object.entries(rawTags).map(([category, items]) => {
      const normalizedItems: string[][] = [];
      if (Array.isArray(items)) {
        let currentRow: string[] = [];
        items.forEach((item: any) => {
          if (Array.isArray(item)) {
            if (currentRow.length > 0) {
              normalizedItems.push(currentRow);
              currentRow = [];
            }
            normalizedItems.push(item.map(String));
          } else if (typeof item === "string") {
            currentRow.push(item);
            if (currentRow.length >= 5) {
              normalizedItems.push(currentRow);
              currentRow = [];
            }
          }
        });
        if (currentRow.length > 0) {
          normalizedItems.push(currentRow);
        }
      }
      return {
        category,
        items: normalizedItems,
      };
    });
  } else if ((dynamicData as any)?.cropPortfolio?.groups) {
    resolvedGroups = (dynamicData as any).cropPortfolio.groups;
  }

  const resolvedCropPortfolio = {
    title: maliksFarmData.cropPortfolio.title,
    description: (dynamicData as any)?.cropPortfolio?.description || "",
    groups: resolvedGroups && resolvedGroups.length > 0 ? resolvedGroups : undefined,
  };

  return (
    <div className="min-h-screen bg-[#F2F7F1]">
      {/* 1. Brand Hero */}
      <BrandHero {...resolvedHero} />

      {/* 2. Brand Intro */}
      <BrandIntro {...resolvedIntro} />

      {/* 3. Custom Brand Split 1 (The Farm) */}
      <section className="w-full bg-[#F2F7F1]  px-4 py-12 md:px-8 md:py-16 lg:px-[100px] lg:py-[100px]">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-8 lg:gap-[64px]">
          {/* Left: Text */}
          <div className="flex max-w-[863px] shrink-0 flex-col items-center justify-center gap-6">
            {resolvedSplit1.badge && (
              <SectionBadge variant="outline" showDot dotSize="6px">
                {resolvedSplit1.badge}
              </SectionBadge>
            )}
            <div className="flex flex-col gap-4">
              <h2 className="text-center font-sans text-[32px] leading-[38px] font-medium text-[#0D1A14] md:text-[48px] md:leading-[58px] lg:text-left">
                {resolvedSplit1.title}
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-center font-sans text-[16px] leading-[24px] text-[#0D1A14]/70 lg:text-left">
              <p className="text-center">{resolvedSplit1.description}</p>
            </div>
          </div>

          {/* Right: Image */}
          {resolvedSplit1.image && (
            <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-neutral-200 lg:rounded-[24px]">
              <OptimizedImage
                src={resolvedSplit1.image}
                alt={resolvedSplit1.title}
                fill
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1240px) 100vw, 1240px"
                quality={90}
                priority
              />
            </div>
          )}
        </div>
      </section>

      {/* 4. Research & Trialling Process Section */}
      <section className="w-full bg-[#F2F7F1] px-4 py-[80px] md:px-8 md:py-[100px] lg:px-[100px]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-12 md:gap-16">
          {/* Header */}
          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-6 text-center">
            {resolvedProcess.badge && (
              <SectionBadge variant="outline" showDot dotSize="6px">
                {resolvedProcess.badge}
              </SectionBadge>
            )}
            <div className="flex flex-col gap-4">
              <h2 className="max-w-[862px] font-sans text-[32px] leading-[38px] font-medium text-[#0D1A14] md:text-[48px] md:leading-[58px]">
                {resolvedProcess.title}
              </h2>
              <p className="mx-auto max-w-[770px] font-sans text-[15px] leading-[24px] text-[#0D1A14]/65 md:text-[16px]">
                {resolvedProcess.description}
              </p>
            </div>
          </div>

          {/* Step Cards Grid */}
          <div className="mx-auto flex w-full max-w-[728px] flex-col items-start gap-8">
            {resolvedProcess.steps.map((step, i) => (
              <div key={i} className="flex w-full items-start gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#0F3221] font-sans text-[18px] leading-[22px] font-medium text-[#F2F7F1]">
                  {step.number}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-sans text-[20px] leading-[29px] font-medium text-[#0D1A14] md:text-[24px]">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[15px] leading-[24px] text-[#0D1A14]/65 md:text-[16px]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* R&D Images Row */}
          {resolvedProcess.images.length > 0 && (
            <div className="flex w-full snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto pb-4 md:gap-6">
              {resolvedProcess.images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative h-[290px] w-[280px] shrink-0 snap-center overflow-hidden rounded-[24px] bg-neutral-200 md:h-[377px] md:w-[608px]"
                >
                  <OptimizedImage
                    src={imgUrl}
                    alt={`Research process image ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 280px, 608px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Commercial Farming Section */}
      <section className="w-full bg-[#F2F7F1] px-4 pt-[80px] pb-6 md:px-8 md:pt-[100px] lg:px-[100px]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-12 md:gap-16">
          {/* Header */}
          <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-6 text-center">
            {resolvedSplit2.badge && (
              <SectionBadge variant="outline" showDot dotSize="6px">
                {resolvedSplit2.badge}
              </SectionBadge>
            )}
            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-[32px] leading-[38px] font-medium text-[#0D1A14] md:text-[48px] md:leading-[58px]">
                {resolvedSplit2.title}
              </h2>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-4">
            {/* GAP card details */}
            <div className="flex flex-col justify-between gap-8 rounded-[24px] border border-[#E4E7EC] bg-white p-4 md:p-6 lg:col-span-2">
              <div className="flex flex-col gap-6 md:gap-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="relative h-14 w-14 shrink-0 md:h-20 md:w-20">
                    <OptimizedImage
                      src={resolvedSplit2.gapLogo}
                      alt="Global GAP badge"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-sans text-[24px] leading-[36px] font-medium text-[#0D1A14]">
                    What is GAP?
                  </h3>
                </div>
              </div>
              <div className="flex flex-col gap-4 text-[15px] leading-[24px] text-[#0D1A14]/65 md:text-[16px]">
                {resolvedSplit2.description
                  .split("\n\n")
                  .map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
              </div>
            </div>

            {/* Small image cards from split2.images */}
            {resolvedSplit2.images.slice(0, 2).map((img, idx) => (
              <div key={idx} className="group relative aspect-square min-h-[320px] overflow-hidden rounded-[24px] bg-neutral-200 lg:aspect-auto lg:h-full">
                <OptimizedImage
                  src={img}
                  alt={`Commercial farming item ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 292px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Crop Portfolio Section */}
      <BrandCropPortfolio {...resolvedCropPortfolio} />

      {/* Commercial Farming Gallery Row */}
      {resolvedSplit2.gallery.length > 0 && (
        <section className="w-full bg-[#F2F7F1] px-4 pb-[80px] md:px-8 md:pb-[100px] lg:px-[100px]">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex w-full snap-x snap-mandatory scrollbar-none gap-4 overflow-x-auto px-10 pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:px-0 md:pb-0">
              {resolvedSplit2.gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative h-[290px] w-[280px] shrink-0 snap-center overflow-hidden rounded-[24px] bg-neutral-200 md:h-[377px] md:w-full md:shrink"
                >
                  <OptimizedImage
                    src={imgUrl}
                    alt={`Agricultural field view ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 280px, 397px"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Training Centre, Facilities & Testimonials */}
      <BrandTraining
        contactInfo={contactInfo}
        trainingData={resolvedTraining}
        testimonialsData={resolvedTestimonials}
        showTestimonials={resolvedTestimonials.visitorScans.length > 0}
      />
    </div>
  );
}
