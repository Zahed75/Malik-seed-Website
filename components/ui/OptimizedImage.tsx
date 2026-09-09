"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { resolveImageUrl } from "@/lib/utils";

// Global cache for loaded image URLs to skip skeleton overlays on subsequent renders in the same session
const loadedCache = new Set<string>();

export interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  mobileSrc?: string | null;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  mobileSrc,
  alt = "",
  fallbackSrc = "/not-found.png",
  className = "",
  style,
  onLoad,
  onError,
  placeholder,
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const resolvedSrc = src ? resolveImageUrl(src) : fallbackSrc;

  // Images routed through our /api/image-proxy or SVGs are already optimized/vector graphics —
  // skip Next.js's built-in /_next/image optimizer to avoid double processing and quality loss.
  const isProxied =
    resolvedSrc.startsWith("/api/image-proxy") ||
    resolvedSrc.startsWith("api/image-proxy");
  const isSvg =
    resolvedSrc.endsWith(".svg") || resolvedSrc.includes(".svg?");

  // Initialize loading state: skip loading skeleton if already cached in session
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !loadedCache.has(resolvedSrc);
    }
    return true; // server side renders skeleton as fallback
  });

  const [error, setError] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Sync state if src changes
  useEffect(() => {
    const isCached = loadedCache.has(resolvedSrc);
    setLoading((prev) => (prev !== !isCached ? !isCached : prev));
    setError((prev) => (prev ? false : prev));
  }, [resolvedSrc]);

  const handleLoad = (e: any) => {
    loadedCache.add(resolvedSrc);
    setLoading((prev) => (prev ? false : prev));
    if (onLoad) onLoad(e);
  };

  const handleError = (e: any) => {
    setError((prev) => (!prev ? true : prev));
    setLoading((prev) => (prev ? false : prev));
    if (onError) onError(e);
  };

  const showPlaceholder =
    placeholder === "blur" && blurDataURL ? "blur" : undefined;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onTouchStart={() => setIsTouched(true)}
      onTouchEnd={() => setIsTouched(false)}
      onTouchCancel={() => setIsTouched(false)}
    >
      {/* Premium Skeleton/Pulse loader */}
      {loading && (
        <div className="bg-brand-bg/50 dark:bg-brand-dark/20 absolute inset-0 z-10 flex animate-pulse items-center justify-center">
          <div className="border-brand-active h-6 w-6 animate-spin rounded-full border-2 border-t-transparent opacity-40" />
        </div>
      )}

      <picture>
        {mobileSrc && (
          <source media="(max-width: 767px)" srcSet={resolveImageUrl(mobileSrc)} />
        )}
        <Image
          {...props}
          src={error ? fallbackSrc : resolvedSrc}
          alt={alt}
          onLoad={handleLoad}
          placeholder={showPlaceholder}
          blurDataURL={blurDataURL}
          onError={handleError}
          unoptimized={props.unoptimized ?? (isProxied || isSvg)}
          className={`${className} transition-all duration-500 ${loading ? "opacity-0" : "opacity-100"
            } ${isTouched ? "scale-105" : ""}`}
          style={style}
        />
      </picture>
    </div>
  );
}
