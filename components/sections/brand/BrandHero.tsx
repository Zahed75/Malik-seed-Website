import OptimizedImage from "@/components/ui/OptimizedImage";
import { ScrollIndicator } from "../HeroSection";
import { memo } from "react";

interface BrandHeroProps {
  title: string;
  bgImage: string;
  mobileBgImage?: string;
}

const BrandHeroOverlays = memo(function HeroOverlays() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute right-0 bottom-0 left-0 z-20 w-full"
        style={{
          height: 284,
          background:
            "linear-gradient(180deg, rgba(13, 26, 20, 0.00) 0%, #0D1A14 100%)",
          backdropFilter: "blur(1.5px)",
          WebkitBackdropFilter: "blur(1.5px)",
        }}
      />
    </>
  );
});

export default function BrandHero({ title, bgImage, mobileBgImage }: BrandHeroProps) {
  const lines = title.split("\n");

  return (
    <section className="relative flex h-screen w-full items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-[#0d1a14]">
        <OptimizedImage
          src={bgImage}
          mobileSrc={mobileBgImage}
          alt={title.replace(/\n/g, " ")}
          fill
          priority
          className="object-cover object-top opacity-90 transition-transform duration-[1200ms] ease-out"
          sizes="100vw"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

      {/* Hero Content */}
      <div className="relative top-[22%] z-30 w-full px-4 pb-10 md:px-8 md:pb-16 lg:px-[100px] lg:pb-[88px]">
        <div className="mx-auto flex flex-col items-center gap-6 md:items-start md:gap-10 lg:gap-14">
          <h1 className="text-center font-sans text-[48px] leading-[48px] font-bold tracking-tight text-white uppercase md:text-left md:text-[72px] md:leading-[72px] lg:text-[96px] lg:leading-[96px]">
            {lines.map((line, i) => (
              <span key={i} className={`${i === 1 ? "text-[#A9E179]" : ""}`}>
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </h1>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="mt-[32px] md:mt-10">
        <ScrollIndicator />
      </div>
      <BrandHeroOverlays />
    </section>
  );
}
