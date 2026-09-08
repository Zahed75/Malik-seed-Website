"use client";

import { useState } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface FlowerSegment {
  id: string;
  name: string;
  description: string;
  varieties: string[];
  image: string;
}

const SEGMENTS: FlowerSegment[] = [
  {
    id: "cut-flower",
    name: "Cut Flower",
    description:
      "Premium quality, long-stemmed flowers grown specifically for florists, events, and vase arrangements. Sourced from global genetics and selected for outstanding color saturation and long vase life.",
    varieties: [
      "Gerbera (Hybrid varieties with thick, strong stems)",
      "Gypsophila (Gypsy Deep Rose, Gypsy White)",
      "Aster (Azumi series with excellent uniformity)",
      "Lisianthus (Rose-like blooms with strong petals)",
      "Marigold (Premium cut-flower varieties)",
    ],
    image: "/images/brand/20250105_120712_1.png",
  },
  {
    id: "bedding-flower",
    name: "Bedding Flower",
    description:
      "Curated varieties optimized for mass landscapes, home gardens, and nurseries. These flower seeds are trialled for high germination rates, rapid early growth, and continuous, heavy blooming periods.",
    varieties: [
      "Petunia (Vibrant color range, heat tolerant)",
      "Marigold (French and African varieties for beds)",
      "Salvia (Deep scarlet and blue spike varieties)",
      "Impatiens (Excellent shade performers)",
      "Pansy & Viola (Perfect for cooler seasons)",
    ],
    image: "/images/brand/gypsy_1.jpg",
  },
  {
    id: "pot-flower",
    name: "Pot Flower",
    description:
      "Perfect compact container and pot varieties suited for urban gardening, balcony setups, and retail pot plant sales. Tailored to grow symmetrically with rich foliage and dense branching.",
    varieties: [
      "Chrysanthemum (Compact pot varieties)",
      "Cyclamen (Ideal for indoor table setups)",
      "Dianthus (Fragrant, dwarf pot selections)",
      "Calibrachoa (Mini-petunias for hanging baskets)",
      "Begonia (Fibrous and tuberous garden pot varieties)",
    ],
    image: "/images/brand/aster_azumi_1.png",
  },
];

export interface BrandFlowerPortfolioProps {
  badge?: string;
  cards?: Array<{
    name: string;
    image: string;
  }>;
}

export default function BrandFlowerPortfolio({
  badge,
  cards,
}: BrandFlowerPortfolioProps) {
  const segments = cards && cards.length > 0
    ? cards.map((card, idx) => {
        const matchedStatic = SEGMENTS.find(
          (s) => s.name.trim().toLowerCase() === card.name.trim().toLowerCase()
        );
        return {
          id: matchedStatic?.id || card.name.trim().toLowerCase().replace(/\s+/g, "-") || `card-${idx}`,
          name: card.name.trim(),
          image: card.image,
          description: matchedStatic?.description || "",
          varieties: matchedStatic?.varieties || [],
        };
      })
    : SEGMENTS;

  const [activeTab, setActiveTab] = useState(segments[0]?.id || "cut-flower");


  return (
    <section className="w-full bg-[#0D1A14] px-4 py-12 text-white md:px-8 md:py-[80px] lg:px-[100px] lg:py-[100px]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 md:gap-12">
        {/* Header */}
        <div className="mx-auto flex max-w-[700px] flex-col gap-4 text-center">
          <SectionBadge className="mx-auto" showDot variant="dark">
            {badge || "OUR FLOWER PORTFOLIO"}
          </SectionBadge>
          <h2 className="font-sans text-[28px] leading-[34px] font-medium text-[#F2F7F1] md:text-[40px] md:leading-[48px]">
            Varieties across three segments
          </h2>
        </div>

        {/* Tabs Control - Pill Slider */}
        <div className="flex justify-center">
          <div
            className="flex max-w-full scrollbar-none gap-[8px] overflow-x-auto rounded-[16px] bg-[#112019] p-[8px]"
          >
            {segments.map((seg) => {
              const isActive = activeTab === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveTab(seg.id)}
                  className={cn(
                    "relative h-[39px] cursor-pointer rounded-[10px] px-4 py-[9px] font-sans text-[12px] leading-[21px] font-medium whitespace-nowrap transition-colors duration-300 ease-in-out md:h-[48px] md:px-4 md:py-3 md:text-[16px] md:leading-[24px]",
                    isActive
                      ? "text-[#0D1A14]"
                      : "text-[#F2F7F1] hover:bg-[#0D291C]/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFlowerTab"
                      className="absolute inset-0 rounded-[10px] bg-[#A9E179]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{seg.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="mt-4 flex items-center justify-center">
          <div className="w-full shrink-0 lg:w-[790px]">
            <div className="group relative aspect-square h-auto w-full overflow-hidden rounded-[20px] border border-white/10 bg-neutral-900 md:aspect-auto md:h-[360px] lg:h-[475px] lg:rounded-[24px]">
              {segments.map((seg) => {
                const isSelected = seg.id === activeTab;
                return (
                  <div
                    key={seg.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500 ease-in-out",
                      isSelected ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                  >
                    <OptimizedImage
                      src={seg.image}
                      alt={seg.name}
                      fill
                      priority={seg.id === "cut-flower"}
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 790px"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
