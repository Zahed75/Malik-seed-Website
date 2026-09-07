import { Fragment } from "react";
import ActionButton from "@/components/ActionButton";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { homepageApi, ApiCtaBanner } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

interface JoinTeamSectionProps {
  apiData?: ApiCtaBanner[];
}

export default async function JoinTeamSection({ apiData: initialApiData }: JoinTeamSectionProps = {}) {
  let apiData: ApiCtaBanner[] | null = initialApiData ?? null;

  if (!apiData) {
    try {
      apiData = await homepageApi.getCtaBanners({ revalidate: 60 });
    } catch (err) {
      console.error("Failed to fetch join team section data from API:", err);
    }
  }

  if (initialApiData !== undefined && Array.isArray(initialApiData) && initialApiData.length === 0) {
    return null;
  }

  const banner = Array.isArray(apiData) && apiData.length > 0 ? apiData[0] : null;
  const joinTeamData = {
    badge: banner?.title || "Join our Team",
    title: banner?.subtitle || "Shape the Future of Agriculture with Malik Seeds",
    cta: {
      label: banner?.cta_text || "Learn More",
      href: banner?.cta_link || "/careers",
    },
    images: {
      desktop: resolveImageUrl(banner?.background_image),
      mobile: resolveImageUrl(banner?.background_image),
    },
  };

  const titleText = joinTeamData.title;

  return (
    // Desktop: 1440x690, bg #F2F7F1 (Figma: Frame 2147229633)
    <section className="w-full bg-[#F2F7F1] py-10 md:py-16 xl:py-[100px]" id="careers">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-16 xl:px-[100px]">
        {/* White card — Mobile: 358x513, radius 24px (Figma: Frame 2147229509) | Desktop: 1240x490, radius 32px */}
        <div className="group relative mx-auto flex min-w-0 w-full max-w-[358px] flex-col items-center justify-between overflow-hidden rounded-[24px] bg-white px-[14px] pt-[24px] pb-[14px] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[620px] xl:h-[490px] xl:max-w-none xl:flex-row xl:rounded-[32px] xl:p-0">
          
          {/* Inner mobile container — Figma: 330x475, gap 32px (Frame 2147229896) */}
          <div className="flex min-w-0 w-full max-w-[330px] flex-col items-center justify-between gap-[32px] sm:max-w-none md:max-w-[480px] lg:max-w-[560px] xl:contents">
            
            {/* Left/Top text content — Mobile: 310x233, gap 24px (Frame 2147229510) | Desktop: 403x301, left:60px, top:95px */}
            <div className="flex min-w-0 w-full max-w-[310px] shrink-0 flex-col items-start justify-between gap-[24px] md:max-w-[448px] lg:max-w-[528px] xl:absolute xl:top-[95px] xl:left-[60px] xl:h-[301px] xl:w-[403px] xl:max-w-none xl:px-0 xl:py-0">
              {/* Badge — Figma: 141x30, radius 30px, dot on right (Frame 2147229487) */}
              <SectionBadge
                variant="outline"
                showDot
                dotPosition="left"
                dotSize="6px"
                className="h-[30px] px-4 normal-case text-[12px] leading-[18px] xl:h-[33px] xl:text-[14px]"
              >
                {joinTeamData.badge}
              </SectionBadge>

              {/* Main content — Mobile: 310x179, gap 24px (Frame 2147229485) | Desktop: 403x252, gap 32px */}
              <div className="flex w-full flex-col items-start justify-between gap-[24px] xl:h-[252px] xl:w-[403px] xl:gap-[32px]">
                {/* Title — Mobile: 310x114 (Frame 2147229501) | Desktop: 403x174 */}
                <div className="relative w-full max-w-[310px] md:max-w-none xl:h-[174px] xl:max-w-[403px]">
                  <h2
                    className="text-brand-dark w-full break-words text-[32px] leading-[38px] font-medium xl:absolute xl:top-0 xl:left-0 xl:w-[403px] xl:text-[48px] xl:leading-[58px]"
                    style={{
                      fontFamily: "var(--font-inter-tight)",
                      fontWeight: 500,
                    }}
                  >
                    {titleText.includes("\n") ? (
                      titleText.split("\n").map((line, idx) => (
                        <Fragment key={idx}>
                          {idx > 0 && <br />}
                          {line}
                        </Fragment>
                      ))
                    ) : ''}
                  </h2>
                </div>

                {/* CTA — Mobile: 123x41, radius 60px (Frame 2147229539) | Desktop: 155x46 (Frame 6) */}
                <ActionButton
                  href={joinTeamData.cta.href}
                  label={joinTeamData.cta.label}
                  variant="dark"
                  className="h-[41px] w-[123px] gap-[6px] px-4 text-[14px] leading-[17px] xl:h-[46px] xl:w-[155px] xl:gap-[10px] xl:px-0 xl:text-[16px] xl:leading-[19px]"
                  customIcon={
                    <ArrowIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/button:translate-x-0.5 xl:h-5 xl:w-5" />
                  }
                  customIconPosition="right"
                />
              </div>
            </div>

            {/* Mobile image container — Figma: 330x210, radius 20px, overflow hidden (Frame 2147229656) */}
            <div className="relative h-[210px] w-full max-w-[330px] overflow-hidden rounded-[20px] bg-white md:h-[240px] md:max-w-[480px] lg:h-[260px] lg:max-w-[560px] xl:hidden">
              {/* Overflowing team image — Figma: 330x248, left:0, top:-19px (Malik Seeds Team-3 2) */}
              <div className="absolute -top-[19px] left-0 h-[248px] w-full overflow-hidden md:h-[calc(100%+38px)]">
                <OptimizedImage
                  src={joinTeamData.images.mobile}
                  alt="Join the Malik Seeds Team"
                  fill
                  sizes="(max-width: 639px) 330px, (max-width: 1023px) 480px, 560px"
                  quality={80}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>

          </div>

          {/* Desktop right image container — Figma: 690x430, left:527px, top:30px (Frame 2147229656) */}
          <div className="relative ml-auto hidden h-[430px] w-full max-w-[690px] overflow-hidden rounded-[32px] bg-white xl:absolute xl:top-[30px] xl:right-[23px] xl:block xl:h-[430px] xl:w-[calc(100%-550px)] xl:max-w-[690px] xl:rounded-[32px]">
            {/* Overflowing team image — Figma: 726x544, left:-30px, top:-32px (Malik Seeds Team-3 2) */}
            <div className="absolute top-[-32px] left-[-30px] h-[544px] w-[min(726px,calc(100%+60px))] overflow-hidden">
              <OptimizedImage
                src={joinTeamData.images.desktop}
                alt="Join the Malik Seeds Team"
                fill
                sizes="(max-width: 1279px) 530px, 690px"
                quality={50}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
