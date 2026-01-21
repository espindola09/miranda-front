"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Slide = {
  key: string;
  title: string;
  href: string;
  img: string;
  // opcional si luego querés optimizar sizes/lcp:
  priority?: boolean; // para el central si querés
};

export default function CategoryFiveSlider() {
  // ✅ Slides fijos (como el mu-plugin)
  const initialSlides: Slide[] = useMemo(
    () => [
      {
        key: "obrazy",
        title: "Obrazy na płótnie",
        href: "/kategoria-produktu/obrazy-na-plotnie/",
        img: "https://drukdekoracje.pl/wp-content/uploads/2025/05/obrazy-na-plotnie.jpg",
      },
      {
        key: "fototapety",
        title: "Fototapety",
        href: "/kategoria-produktu/fototapety/",
        img: "https://drukdekoracje.pl/wp-content/uploads/2025/05/Fototapety.jpg",
      },
      {
        key: "plakaty",
        title: "Plakaty",
        href: "/kategoria-produktu/plakaty",
        img: "https://drukdekoracje.pl/wp-content/uploads/2025/05/Plakaty.jpg",
        priority: true, // ✅ central inicial
      },
      {
        key: "naklejki",
        title: "Naklejki ścienne",
        href: "/kategoria-produktu/naklejki-scienne/",
        img: "https://drukdekoracje.pl/wp-content/uploads/2025/05/naklejki-scienne.jpg",
      },
      {
        key: "wlasny",
        title: "Własny obraz",
        href: "/wlasny-obraz/",
        img: "https://drukdekoracje.pl/wp-content/uploads/2025/06/wlasny-obrazv2.jpg",
      },
    ],
    []
  );

  const [slides, setSlides] = useState<Slide[]>(initialSlides);

  // ✅ Autoplay
  const intervalRef = useRef<number | null>(null);

  // ✅ Drag/Swipe control
  const pointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const movedRef = useRef(false);

  const stopAutoplay = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    intervalRef.current = window.setInterval(() => {
      rotateNext();
    }, 2000);
  };

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

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ En mobile deben verse EXACTAMENTE 3: idx 1,2,3 (vecino, activo, vecino)
  const mobileVisible = useMemo(() => {
    if (slides.length < 5) return slides;
    return [slides[1], slides[2], slides[3]];
  }, [slides]);

  // ✅ Pointer events (sirve para mouse + touch)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;
    if (Math.abs(e.clientX - startXRef.current) > 5) {
      movedRef.current = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;

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

  const onPointerLeave = () => {
    pointerDownRef.current = false;
  };

  // ✅ Evitar click accidental tras drag/swipe (como tu plugin)
  const onMaybePreventClick = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-10">
        {/* Título */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a]">
          Wybierz rodzaj dekoracji do swojego wnętrza
        </h2>

        {/* Carrusel */}
        <div
          className={[
            "mt-8",
            "select-none",
            "touch-pan-y", // como el plugin (pan-y)
          ].join(" ")}
        >
          {/* Desktop (>= md): 5 visibles */}
          <div
            className={[
              "hidden md:flex",
              "items-end justify-center gap-3",
              "overflow-visible",
              "cursor-grab active:cursor-grabbing",
              "py-10",
            ].join(" ")}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
          >
            {slides.map((s, idx) => {
              const isActive = idx === 2;

              // laterales opacos (0.6) y hover => 1, como plugin
              const baseOpacity = isActive ? "opacity-100" : "opacity-60";
              const hoverOpacity = isActive ? "" : "hover:opacity-100";

              const imgW = isActive ? 340 : 240;
              const imgH = isActive ? 420 : 350;

              return (
                <div
                  key={s.key}
                  className={[
                    "shrink-0 text-center",
                    "transition-opacity duration-1000 ease-in-out",
                    isActive ? "z-10" : "z-0",
                    baseOpacity,
                    hoverOpacity,
                  ].join(" ")}
                >
                  <Link href={s.href} onClick={onMaybePreventClick}>
                    <div
                      className={[
                        "relative",
                        isActive ? "rounded-[10px] overflow-hidden" : "",
                      ].join(" ")}
                      style={{ width: imgW, height: imgH }}
                    >
                      <Image
                        src={s.img}
                        alt={s.title}
                        fill
                        sizes={isActive ? "340px" : "240px"}
                        className="object-cover"
                        priority={Boolean(s.priority)}
                      />
                    </div>

                    <div
                      className={[
                        "mt-3 inline-block",
                        "px-4 py-1.5",
                        "rounded-full",
                        "bg-black/70 text-white font-bold",
                        "transition-opacity duration-1000 ease-in-out",
                        isActive ? "opacity-100" : "opacity-60 hover:opacity-100",
                      ].join(" ")}
                    >
                      {s.title}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Mobile (< md): SOLO 3 visibles (1,2,3) */}
          <div
            className={[
              "md:hidden flex",
              "items-center justify-center gap-2",
              "py-6",
            ].join(" ")}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
          >
            {mobileVisible.map((s, localIdx) => {
              // En mobile, el centro es localIdx === 1
              const isCenter = localIdx === 1;

              // tamaños similares al plugin
              const containerStyle = isCenter
                ? { width: "58vw", maxWidth: 240, height: 320 }
                : { width: "22vw", maxWidth: 90, height: 260 };

              return (
                <div key={s.key} className="shrink-0 text-center">
                  <Link href={s.href} onClick={onMaybePreventClick}>
                    <div className="relative mx-auto" style={containerStyle}>
                      <Image
                        src={s.img}
                        alt={s.title}
                        fill
                        sizes={isCenter ? "58vw" : "22vw"}
                        className={[
                          "object-cover",
                          "transition-opacity duration-1000 ease-in-out",
                          isCenter ? "opacity-100" : "opacity-60",
                        ].join(" ")}
                        priority={Boolean(isCenter && s.priority)}
                      />
                    </div>

                    {/* En mobile SOLO mostrar título del centro (como plugin) */}
                    {isCenter ? (
                      <div className="mt-3 inline-block rounded-full bg-black/70 px-4 py-1.5 text-white font-bold">
                        {s.title}
                      </div>
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Flechas (solo desktop, abajo) */}
          <div className="hidden md:flex justify-center gap-3 mt-3">
            <button
              type="button"
              className={[
                "w-9 h-9",
                "flex items-center justify-center",
                "bg-white text-[#444]",
                "border border-[#ccc]",
                "text-2xl leading-none",
                "transition-colors",
                "hover:bg-[#f0f0f0] hover:border-[#999]",
              ].join(" ")}
              onMouseEnter={stopAutoplay}
              onMouseLeave={startAutoplay}
              onClick={() => {
                stopAutoplay();
                rotatePrev();
                startAutoplay();
              }}
              aria-label="Poprzedni"
            >
              ❮
            </button>

            <button
              type="button"
              className={[
                "w-9 h-9",
                "flex items-center justify-center",
                "bg-white text-[#444]",
                "border border-[#ccc]",
                "text-2xl leading-none",
                "transition-colors",
                "hover:bg-[#f0f0f0] hover:border-[#999]",
              ].join(" ")}
              onMouseEnter={stopAutoplay}
              onMouseLeave={startAutoplay}
              onClick={() => {
                stopAutoplay();
                rotateNext();
                startAutoplay();
              }}
              aria-label="Następny"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
