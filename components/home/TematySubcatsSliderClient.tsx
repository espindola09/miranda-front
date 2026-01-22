"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Item = {
  id: number;
  name: string;
  slug: string;
  image: string;
  href: string;
};

type Props = {
  title?: string;
  description?: string;
  buttonHref?: string;
  buttonLabel?: string;
  items: Item[];
};

function getSlidesPerView(w: number) {
  if (w < 768) return 1;
  if (w < 1024) return 2;
  if (w < 1400) return 3;
  return 5;
}

export default function TematySubcatsSliderClient({
  title = "Fototapety według tematu i motywu",
  description = "Przeglądaj szeroką gamę tapet: fototapety abstrakcyjne, fototapety natura i artystyczne wzory. Znajdź swój idealny motyw i odmień wnętrze już dziś!",
  buttonHref = "/kategoria-produktu/tematy",
  buttonLabel = "ZOBACZ WSZYSTKIE",
  items,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1400);
  const [containerW, setContainerW] = useState<number>(1200);
  const [isPaused, setIsPaused] = useState(false);

  // Loop infinito con clones (buffer máximo 5)
  const extended = useMemo(() => {
    const safe = Array.isArray(items) ? items : [];
    if (safe.length <= 1) return safe;

    const buffer = Math.min(5, safe.length);
    const head = safe.slice(0, buffer);
    const tail = safe.slice(-buffer);
    return [...tail, ...safe, ...head];
  }, [items]);

  const realLen = items?.length || 0;
  const buffer = Math.min(5, realLen);

  // arrancamos al “primer real”
  const [index, setIndex] = useState(() => (realLen > 1 ? buffer : 0));
  const [withTransition, setWithTransition] = useState(true);

  const slidesPerView = useMemo(() => getSlidesPerView(vw), [vw]);

  const gap = 20;

  // En este slider el círculo es 150px; aún así mantenemos track fluido por slideW
  const slideW = useMemo(() => {
    const w = Math.max(320, containerW || 1200);
    return Math.floor((w - gap * (slidesPerView - 1)) / slidesPerView);
  }, [containerW, slidesPerView]);

  // Observers: viewport + contenedor
  useEffect(() => {
    function onResize() {
      setVw(window.innerWidth);
    }
    window.addEventListener("resize", onResize);

    const el = containerRef.current;
    if (!el) return () => window.removeEventListener("resize", onResize);

    const ro = new ResizeObserver(() => {
      setContainerW(el.clientWidth);
    });
    ro.observe(el);

    setContainerW(el.clientWidth);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  // Autoplay (igual al back: 2500)
  useEffect(() => {
    if (!realLen || realLen <= 1) return;
    if (isPaused) return;

    const id = window.setInterval(() => {
      next();
    }, 2500);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, realLen, index, slidesPerView, slideW]);

  function next() {
    if (extended.length <= 1) return;
    setWithTransition(true);
    setIndex((v) => v + 1);
  }

  function prev() {
    if (extended.length <= 1) return;
    setWithTransition(true);
    setIndex((v) => v - 1);
  }

  // Corrección del loop
  useEffect(() => {
    if (realLen <= 1) return;

    const onEnd = () => {
      const minReal = buffer;
      const maxReal = buffer + realLen - 1;

      if (index > maxReal) {
        setWithTransition(false);
        setIndex(minReal);
      } else if (index < minReal) {
        setWithTransition(false);
        setIndex(maxReal);
      }
    };

    const track = trackRef.current;
    if (!track) return;

    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [index, realLen, buffer]);

  // Drag / swipe
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.clientX;
    };

    const onUp = (e: MouseEvent) => {
      if (!isDown) return;
      isDown = false;
      const diff = e.clientX - startX;

      if (diff > 60) prev();
      else if (diff < -60) next();
    };

    const onLeave = () => {
      isDown = false;
    };

    track.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    track.addEventListener("mouseleave", onLeave);

    // Touch
    let touchStart = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStart = e.changedTouches[0].screenX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const diff = e.changedTouches[0].screenX - touchStart;
      if (diff > 60) prev();
      else if (diff < -60) next();
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      track.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      track.removeEventListener("mouseleave", onLeave);

      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideW, slidesPerView, extended.length]);

  const translateX = useMemo(() => -(index * (slideW + gap)), [index, slideW]);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-12">
        {/* TÍTULO + DESCRIPCIÓN */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a]">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-sm md:text-base text-black/70 leading-relaxed">
            {description}
          </p>
        </div>

        {/* CARRUSEL */}
        <div
          ref={containerRef}
          className="relative mx-auto mt-10 w-full max-w-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex items-stretch"
              style={{
                gap: `${gap}px`,
                transform: `translate3d(${translateX}px, 0, 0)`,
                transition: withTransition ? "transform 600ms ease" : "none",
                willChange: "transform",
                cursor: "grab",
              }}
            >
              {extended.map((it, i) => {
                const imgSrc =
                  it?.image && String(it.image).length
                    ? it.image
                    : "https://via.placeholder.com/150?text=Sin+Imagen";

                const isFirst = i === 0;

                return (
                  <div
                    key={`${it.id}-${i}`}
                    className="shrink-0 text-center"
                    style={{ width: `${slideW}px` }}
                  >
                    <Link href={it.href} className="block select-none">
                      {/* ✅ CÍRCULO 150x150 EXACTO */}
                      <div className="mx-auto relative w-37.5 h-37.5 overflow-hidden rounded-full bg-transparent">
                        <Image
                          src={imgSrc}
                          alt={it.name}
                          fill
                          sizes="150px"
                          priority={isFirst}
                          fetchPriority={isFirst ? "high" : "auto"}
                          className="object-cover transition-transform duration-300 ease-out hover:scale-[1.05]"
                        />
                      </div>

                      <div className="mt-3 font-bold text-[#333] text-sm md:text-base">
                        {it.name}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flechas minimalistas (igual que el back) */}
          <button
            type="button"
            aria-label="Poprzednie"
            onClick={() => {
              setIsPaused(true);
              prev();
              setTimeout(() => setIsPaused(false), 1200);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                       bg-transparent border-none p-0
                       text-4xl leading-none text-[#333]"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Następne"
            onClick={() => {
              setIsPaused(true);
              next();
              setTimeout(() => setIsPaused(false), 1200);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                       bg-transparent border-none p-0
                       text-4xl leading-none text-[#333]"
          >
            ›
          </button>
        </div>

        {/* BOTÓN EXACTO (fondo dorado + texto blanco) */}
        <div className="mt-10 flex justify-center">
          <Link
            href={buttonHref}
            className={[
              "inline-flex items-center justify-center",
              "bg-[#c9b086]",
              "px-10 py-3",
              "text-sm font-semibold",
              "text-white!",
              "hover:opacity-90",
              "uppercase",
            ].join(" ")}
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
