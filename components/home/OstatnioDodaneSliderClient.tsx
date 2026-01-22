"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// Swiper (igual enfoque que tus sliders)
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

type WooImg = { src?: string; alt?: string };
type WooProduct = {
  id: number;
  name: string;
  slug: string;
  images?: WooImg[];
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  average_rating?: string; // "4.7"
  rating_count?: number;
};

function toNumber(v?: string) {
  const n = Number(String(v || "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatPLN(p?: string) {
  if (!p) return "";
  // Woo a veces manda "41.92" como string
  const n = toNumber(p);
  if (!n) return "";
  return `${n.toFixed(2)} zł`;
}

function percentOff(regular?: string, sale?: string) {
  const r = toNumber(regular);
  const s = toNumber(sale);
  if (!r || !s || s >= r) return null;
  return Math.round(((r - s) / r) * 100);
}

function Stars({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="mt-1 text-center leading-none" aria-label={`Ocena ${full} na 5`}>
      {"★★★★★".split("").map((ch, i) => (
        <span
          key={i}
          className={i < full ? "text-[#f2c200] text-base" : "text-black/15 text-base"}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

export default function OstatnioDodaneSliderClient({
  products,
  viewAllHref = "/sklep-fototapety",
}: {
  products: WooProduct[];
  viewAllHref?: string;
}) {
  const items = useMemo(() => (Array.isArray(products) ? products : []).slice(0, 15), [products]);

  if (!items.length) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-12">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a]">
            Nowości w naszej kolekcji
          </h2>
          <p className="mt-3 text-sm md:text-base text-black/70 max-w-3xl mx-auto">
            Poznaj nasze ostatnio dodane tapety! Nowoczesne wzory, modne kolory i wyjątkowe tekstury —
            idealne do sypialni, salonu czy biura. Sprawdź, co nowego przygotowaliśmy dla Ciebie
          </p>
        </div>

        {/* Slider */}
        <div className="relative mt-8">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              nextEl: ".ostatnio-next",
              prevEl: ".ostatnio-prev",
            }}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 10 },
              768: { slidesPerView: 2, spaceBetween: 15 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1400: { slidesPerView: 4, spaceBetween: 20 },
            }}
          >
            {items.map((p, idx) => {
              const img = p.images?.[0]?.src || "https://via.placeholder.com/600x600?text=No+Image";
              const alt = p.images?.[0]?.alt || p.name;

              const isSale = !!p.on_sale && !!p.sale_price && !!p.regular_price;
              const off = isSale ? percentOff(p.regular_price, p.sale_price) : null;

              const rating = Math.max(0, Math.min(5, Number(p.average_rating || 0)));

              const href = `/produkt/${p.slug}`;

              // precio visual similar: del/ins
              const regular = formatPLN(p.regular_price);
              const sale = formatPLN(p.sale_price);
              const price = formatPLN(p.price);

              const showRegular = isSale && regular;
              const showSale = isSale && sale;

              return (
                <SwiperSlide key={p.id}>
                  <div className="text-center">
                    {/* Imagen + badge */}
                    <div className="relative mx-auto w-75 h-75 overflow-hidden rounded-xl">
                      <Link href={href} className="block w-full h-full">
                        <Image
                          src={img}
                          alt={alt}
                          fill
                          sizes="300px"
                          className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                          priority={idx === 0}
                        />
                        {off ? (
                          <span className="absolute top-3 left-3 z-10 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-red-600">
                            -{off}%
                          </span>
                        ) : null}
                      </Link>
                    </div>

                    {/* Título */}
                    <Link href={href} className="block mt-3 text-sm font-semibold text-black/80">
                      {p.name}
                    </Link>

                    {/* Precio */}
                    <Link href={href} className="block mt-1 text-sm">
                      {showRegular && showSale ? (
                        <span className="inline-flex items-center gap-2">
                          <del className="text-[#c9b086]">{regular}</del>
                          <ins className="no-underline font-bold text-black">{sale}</ins>
                        </span>
                      ) : (
                        <span className="font-bold text-black">{price}</span>
                      )}
                    </Link>

                    {/* Rating */}
                    <Link href={href} className="block">
                      <Stars rating={rating || 5} />
                    </Link>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Flechas minimalistas */}
          <button
            type="button"
            className="ostatnio-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center text-black/70 hover:bg-white"
            aria-label="Poprzedni"
          >
            ‹
          </button>
          <button
            type="button"
            className="ostatnio-next absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center text-black/70 hover:bg-white"
            aria-label="Następny"
          >
            ›
          </button>
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-center bg-[#c9b086] px-10 py-3 text-sm font-bold text-white uppercase"
          >
            ZOBACZ WSZYSTKIE
          </Link>
        </div>
      </div>
    </section>
  );
}
