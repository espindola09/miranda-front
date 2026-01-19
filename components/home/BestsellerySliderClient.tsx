"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type WooImg = { src?: string; alt?: string };
type WooCategory = { id?: number; name?: string; slug?: string };
type WooProduct = {
  id: number;
  name: string;
  slug: string;
  images?: WooImg[];

  // precios Woo
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  price_html?: string;

  // rating Woo
  average_rating?: string; // "4.7"
  rating_count?: number;

  categories?: WooCategory[];
};

function stripHtml(html: string) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPricePLN(p?: string) {
  if (!p) return "";
  return `${p} zł`;
}

function StarRow({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div
      className="mt-2 flex items-center justify-center gap-1"
      aria-label={`Ocena: ${rating}/5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < full ? "text-[#f2c200] text-sm" : "text-black/15 text-sm"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Breakpoints:
 * - mobile: 1 visible
 * - md: 2 visibles
 * - lg+: 4 visibles (requerido)
 */
function useVisibleCount() {
  const [count, setCount] = useState(4);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1024) return 4; // lg+
      if (w >= 768) return 2; // md
      return 1; // mobile
    };

    const onResize = () => setCount(calc());
    setCount(calc());

    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return count;
}

export default function BestsellerySliderClient({
  products,
  viewAllHref = "/kategoria-produktu/bestsellery",
}: {
  products: WooProduct[];
  viewAllHref?: string;
}) {
  const items = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  const visibleCount = useVisibleCount();

  // Track + medición para mover EXACTAMENTE 1 card por paso (sin “peek” en mobile)
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);

  const [stepPx, setStepPx] = useState(0);
  const [index, setIndex] = useState(0);

  // Reset “infinito”
  const [enableTransition, setEnableTransition] = useState(true);

  // ✅ MEJORA: loop REAL sin huecos (aunque items < visibleCount)
  // Extend para loop suave: clones al final (al menos "visibleCount" y, si hace falta, repetimos)
  const extended = useMemo(() => {
    if (!items.length) return [];

    const cloneTarget = Math.max(visibleCount, 1);

    const clones: WooProduct[] = [];
    for (let i = 0; i < cloneTarget; i++) {
      clones.push(items[i % items.length]);
    }

    return [...items, ...clones];
  }, [items, visibleCount]);

  // Medir step = ancho de card + gap real
  useEffect(() => {
    const measure = () => {
      const card = firstCardRef.current;
      if (!card) return;

      const cardW = card.offsetWidth;

      const track = card.parentElement;
      if (!track) return;

      const styles = window.getComputedStyle(track);
      const gapStr = styles.columnGap || styles.gap || "0px";
      const gap = Number.parseFloat(gapStr) || 0;

      setStepPx(cardW + gap);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (firstCardRef.current) ro.observe(firstCardRef.current);

    return () => ro.disconnect();
  }, [visibleCount, items.length]);

  // Autoplay cada 3s (desktop + mobile)
  useEffect(() => {
    if (!items.length) return;

    const t = window.setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 3000);

    return () => window.clearInterval(t);
  }, [items.length]);

  const goPrev = () => {
    if (!items.length) return;

    if (index === 0) {
      setEnableTransition(false);
      setIndex(items.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
          setIndex(items.length - 1);
        });
      });
      return;
    }

    setIndex((p) => p - 1);
  };

  const goNext = () => {
    if (!items.length) return;
    setIndex((p) => p + 1);
  };

  const onTrackTransitionEnd = () => {
    if (!items.length) return;

    // ✅ MEJORA: si por autoplay/click nos pasamos del final (>=),
    // volvemos a un índice válido sin transición (no se verá “vacío” nunca).
    if (index >= items.length) {
      const nextIndex = index % items.length;

      setEnableTransition(false);
      setIndex(nextIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEnableTransition(true));
      });
    }
  };

  if (!items.length) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Título + descripción (centrado) */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a]">
            Nasze Bestsellery
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-sm md:text-base leading-relaxed text-black/70">
            Wyselekcjonowane fototapety na zamówienie. Najczęściej wybierane
            fototapety przez naszych klientów! Sprawdź hity sprzedaży – stylowe,
            trwałe i perfekcyjnie dopasowane do wnętrza. Wybierz bestseller i
            odmień swoją przestrzeń już dziś!
          </p>
        </div>

        {/* Slider (viewport oculto; flechas DENTRO del área) */}
        <div className="relative mt-10">
          <div
            ref={viewportRef}
            className="relative overflow-hidden"
            aria-label="Bestsellery"
          >
            {/* ✅ SOLO 2 FLECHAS (mobile + desktop). Quitamos las “decorativas” para no duplicar. */}
            <button
              type="button"
              onClick={goPrev}
              className={[
                "absolute left-3 z-20 grid place-items-center rounded-full",
                "border border-black/10 bg-white/90 shadow-sm",
                "hover:border-[#c9b086] transition",
                // en mobile subimos un poco para que se vea “dentro” de la imagen (como tu referencia)
                "top-[38%] -translate-y-1/2",
                "h-10 w-10 sm:h-11 sm:w-11",
                "md:top-1/2",
              ].join(" ")}
              aria-label="Poprzednie"
              title="Poprzednie"
            >
              <span className="text-xl leading-none">‹</span>
            </button>

            <button
              type="button"
              onClick={goNext}
              className={[
                "absolute right-3 z-20 grid place-items-center rounded-full",
                "border border-black/10 bg-white/90 shadow-sm",
                "hover:border-[#c9b086] transition",
                "top-[38%] -translate-y-1/2",
                "h-10 w-10 sm:h-11 sm:w-11",
                "md:top-1/2",
              ].join(" ")}
              aria-label="Następne"
              title="Następne"
            >
              <span className="text-xl leading-none">›</span>
            </button>

            {/* Track */}
            <div
              className={[
                "flex gap-6",
                enableTransition
                  ? "transition-transform duration-500 ease-in-out"
                  : "transition-none",
              ].join(" ")}
              style={{
                transform: `translateX(-${stepPx * index}px)`,
              }}
              onTransitionEnd={onTrackTransitionEnd}
            >
              {extended.map((p, i) => {
                const img = p.images?.[0]?.src || "";
                const alt = p.images?.[0]?.alt || p.name;

                const regular = p.regular_price || "";
                const sale = p.sale_price || "";
                const onSale = Boolean(p.on_sale && sale);

                const rating = Number(p.average_rating || 0);
                const fallbackPriceText = stripHtml(p.price_html || "");

                return (
                  <div
                    key={`${p.id}-${i}`}
                    ref={i === 0 ? firstCardRef : undefined}
                    className={[
                      "shrink-0",
                      // ✅ mobile: 1 card EXACTA (sin corte)
                      "w-full",
                      // ✅ md: 2 visibles
                      "md:w-[calc((100%-24px)/2)]",
                      // ✅ lg+: 4 visibles EXACTAS (3 gaps * 24px)
                      "lg:w-[calc((100%-72px)/4)]",
                    ].join(" ")}
                  >
                    <article className="w-full">
                      <Link href={`/produkt/${p.slug}`} className="block group">
                        <div className="relative overflow-hidden rounded-2xl bg-white">
                          {/* Imagen */}
                          <div className="relative aspect-square overflow-hidden rounded-2xl">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img}
                                alt={alt}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full grid place-items-center text-black/40 text-sm border border-black/10 rounded-2xl">
                                No image
                              </div>
                            )}

                            {/* Badge descuento */}
                            <div className="absolute left-3 top-3">
                              <div className="h-10 w-10 rounded-full bg-white grid place-items-center shadow-sm">
                                <span className="text-xs font-extrabold text-red-600">
                                  -40%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Texto */}
                          <div className="pt-4 text-center">
                            <h3 className="px-2 text-sm font-semibold text-black leading-snug">
                              {p.name}
                            </h3>

                            {/* Precios */}
                            <div className="mt-2 text-sm">
                              {onSale ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-black/40 line-through">
                                    {formatPricePLN(regular) ||
                                      fallbackPriceText}
                                  </span>
                                  <span className="font-bold text-black">
                                    {formatPricePLN(sale)}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-black/80">
                                  {formatPricePLN(p.price) || fallbackPriceText}
                                </div>
                              )}
                            </div>

                            {/* Estrellas */}
                            <StarRow rating={rating} />
                          </div>
                        </div>
                      </Link>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA ver todos */}
        <div className="mt-10 flex justify-center">
          <Link
            href={viewAllHref}
            className={[
              "inline-flex items-center justify-center",
              "bg-[#c9b086] px-7 py-3",
              "text-sm font-extrabold tracking-wide",
              "text-white!", // ✅ fuerza blanco
              "hover:opacity-90 transition",
            ].join(" ")}
          >
            ZOBACZ WSZYSTKIE
          </Link>
        </div>
      </div>
    </section>
  );
}
