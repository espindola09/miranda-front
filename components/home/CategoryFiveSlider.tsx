"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type SlideItem = {
  href: string;
  title: string;
  img: {
    src: string;
    alt: string;
  };
};

type Props = {
  title?: string;
  items?: SlideItem[];
  autoplayMs?: number; // default 2000
};

const DEFAULT_ITEMS: SlideItem[] = [
  {
    href: "/kategoria-produktu/naklejki-scienne",
    title: "Naklejki ścienne",
    img: {
      src: "https://drukdekoracje.pl/wp-content/uploads/2025/05/naklejki-scienne.jpg",
      alt: "Naklejki ścienne",
    },
  },
  {
    href: "/wlasny-obraz",
    title: "Własny obraz",
    img: {
      src: "https://drukdekoracje.pl/wp-content/uploads/2025/06/wlasny-obrazv2.jpg",
      alt: "Własny obraz",
    },
  },
  {
    href: "/kategoria-produktu/obrazy-na-plotnie",
    title: "Obrazy na płótnie",
    img: {
      src: "https://drukdekoracje.pl/wp-content/uploads/2025/05/obrazy-na-plotnie.jpg",
      alt: "Obrazy na płótnie",
    },
  },
  {
    href: "/kategoria-produktu/fototapety",
    title: "Fototapety",
    img: {
      src: "https://drukdekoracje.pl/wp-content/uploads/2025/05/Fototapety.jpg",
      alt: "Fototapety",
    },
  },
  {
    href: "/kategoria-produktu/plakaty",
    title: "Plakaty",
    img: {
      src: "https://drukdekoracje.pl/wp-content/uploads/2025/05/Plakaty.jpg",
      alt: "Plakaty",
    },
  },
];

export default function CategoryFiveSlider({
  title = "Wybierz rodzaj dekoracji do swojego wnętrza",
  items = DEFAULT_ITEMS,
  autoplayMs = 2000,
}: Props) {
  // siempre 5 items (si pasan menos, repetimos; si pasan más, tomamos 5)
  const base = useMemo(() => {
    const arr = Array.isArray(items) ? items.filter(Boolean) : [];
    if (arr.length === 5) return arr;

    if (arr.length > 5) return arr.slice(0, 5);

    // si vienen menos, repetimos hasta 5
    const out: SlideItem[] = [];
    let i = 0;
    while (out.length < 5 && arr.length) {
      out.push(arr[i % arr.length]);
      i++;
    }
    return out.length ? out : DEFAULT_ITEMS;
  }, [items]);

  // estado: lista rotativa
  const [slides, setSlides] = useState<SlideItem[]>(base);

  useEffect(() => {
    setSlides(base);
  }, [base]);

  // autoplay control
  const intervalRef = useRef<number | null>(null);
  const stopAutoplay = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };
  const startAutoplay = () => {
    stopAutoplay();
    intervalRef.current = window.setInterval(() => {
      rotateNext();
    }, autoplayMs);
  };

  // drag/swipe anti-click
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const movedRef = useRef(false);

  const rotateNext = () => {
    setSlides((prev) => {
      if (!prev.length) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const rotatePrev = () => {
    setSlides((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
  };

  // init autoplay
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayMs]);

  // mouse drag desktop
  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    if (Math.abs(e.clientX - startXRef.current) > 5) movedRef.current = true;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const diff = e.clientX - startXRef.current;

    if (diff > 50) {
      stopAutoplay();
      rotatePrev();
      startAutoplay();
    } else if (diff < -50) {
      stopAutoplay();
      rotateNext();
      startAutoplay();
    }
  };

  const onMouseLeave = () => {
    isDraggingRef.current = false;
  };

  // touch swipe mobile
  const touchStartRef = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.changedTouches[0]?.screenX ?? 0;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0]?.screenX ?? 0;
    const diff = endX - touchStartRef.current;

    if (diff > 50) {
      stopAutoplay();
      rotatePrev();
      startAutoplay();
    } else if (diff < -50) {
      stopAutoplay();
      rotateNext();
      startAutoplay();
    }
  };

  const handlePrev = () => {
    stopAutoplay();
    rotatePrev();
    startAutoplay();
  };

  const handleNext = () => {
    stopAutoplay();
    rotateNext();
    startAutoplay();
  };

  // índice central fijo = 2
  const ACTIVE_INDEX = 2;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-10">
        {/* título */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a]">
            {title}
          </h2>
        </div>

        {/* carrusel */}
        <div className="mt-10">
          <div
            className={[
              "mx-auto",
              "flex justify-center items-end gap-2.5",
              "py-10",
              "max-w-350",
              "overflow-visible",
              "select-none",
              "cursor-grab active:cursor-grabbing",
              // mobile: centrado + touch-action pan-y
              "touch-pan-y",
            ].join(" ")}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            aria-label="Slider kategorii"
          >
            {slides.map((s, idx) => {
              const isActive = idx === ACTIVE_INDEX;

              return (
                <div
                  key={`${s.title}-${idx}`}
                  className={[
                    "flex-none text-center",
                    "transition-opacity duration-1000 ease-in-out",
                    isActive ? "opacity-100 z-3" : "opacity-100 z-1",
                    // mobile: solo mostrar 2,3,4 (idx 1,2,3)
                    "max-md:hidden",
                    idx === 1 || idx === 2 || idx === 3 ? "max-md:block" : "",
                  ].join(" ")}
                >
                  <Link
                    href={s.href}
                    className="block"
                    onClick={(e) => {
                      // evita click accidental tras drag (igual WP)
                      if (movedRef.current) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {/* imagen */}
                    <div className="mx-auto">
                      {/* desktop sizes */}
                      <img
                        src={s.img.src}
                        alt={s.img.alt}
                        loading={isActive ? "eager" : "lazy"}
                        decoding="async"
                        className={[
                          "object-cover",
                          "transition-opacity duration-1000 ease-in-out",
                          // base desktop
                          !isActive
                            ? "opacity-60 w-60 h-87.5"
                            : "opacity-100 w-85 h-105 rounded-[10px]",
                          // hover laterales -> opacidad 100
                          !isActive ? "hover:opacity-100" : "",
                          // mobile behavior
                          // laterales: 22vw max 90px height 260
                          idx === 1 || idx === 3
                            ? "max-md:w-[22vw] max-md:max-w-22.5 max-md:h-65 max-md:opacity-60"
                            : "",
                          // centro: 58vw max 240 height 320
                          idx === 2
                            ? "max-md:w-[58vw] max-md:max-w-60 max-md:h-80 max-md:opacity-100"
                            : "",
                        ].join(" ")}
                      />
                    </div>

                    {/* title */}
                    <div
                      className={[
                        "mx-auto mt-2 inline-block",
                        "px-4 py-1.5",
                        "rounded-[20px]",
                        "bg-black/70 text-white font-bold",
                        "transition-opacity duration-1000 ease-in-out",
                        isActive ? "opacity-100" : "opacity-60",
                        !isActive ? "hover:opacity-100" : "",
                        // mobile: ocultar títulos laterales
                        idx === 1 || idx === 3 ? "max-md:hidden" : "",
                        idx === 2 ? "max-md:block max-md:text-base" : "",
                      ].join(" ")}
                    >
                      {s.title}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* nav desktop abajo */}
          <div className="mt-3 hidden md:flex justify-center gap-3">
            <button
              type="button"
              className={[
                "bg-white text-[#444]",
                "border border-[#ccc]",
                "text-2xl",
                "w-9 h-9",
                "flex items-center justify-center",
                "cursor-pointer",
                "transition-colors duration-300",
                "hover:bg-[#f0f0f0] hover:border-[#999]",
              ].join(" ")}
              onMouseEnter={stopAutoplay}
              onMouseLeave={startAutoplay}
              onClick={handlePrev}
              aria-label="Poprzedni"
              title="Poprzedni"
            >
              ❮
            </button>

            <button
              type="button"
              className={[
                "bg-white text-[#444]",
                "border border-[#ccc]",
                "text-2xl",
                "w-9 h-9",
                "flex items-center justify-center",
                "cursor-pointer",
                "transition-colors duration-300",
                "hover:bg-[#f0f0f0] hover:border-[#999]",
              ].join(" ")}
              onMouseEnter={stopAutoplay}
              onMouseLeave={startAutoplay}
              onClick={handleNext}
              aria-label="Następny"
              title="Następny"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
