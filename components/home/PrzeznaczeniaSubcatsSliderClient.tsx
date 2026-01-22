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

export default function PrzeznaczeniaSubcatsSliderClient({
  title = "Fototapety według pomieszczeń",
  description = "Odkryj tapety do sypialni, biura lub pokoju dla dzieci, które nadają wnętrzu przytulny klimat. Stonowane odcienie, subtelne wzory i eleganckie tekstury pomogą Ci stworzyć idealne miejsce do odpoczynku. Dopasuj tapetę do swojego stylu i ciesz się wyjątkowym wnętrzem.",
  buttonHref = "/kategoria-produktu/przeznaczenia",
  buttonLabel = "ZOBACZ WSZYSTKIE",
  items,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [vw, setVw] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1400);
  const [containerW, setContainerW] = useState<number>(1200);
  const [isPaused, setIsPaused] = useState(false);

  // Loop infinito con clones
  const extended = useMemo(() => {
    const safe = Array.isArray(items) ? items : [];
    if (safe.length <= 1) return safe;

    // clones: [ ...lastN, ...items, ...firstN ]
    // usamos 5 como máximo por view, con buffer
    const buffer = Math.min(5, safe.length);
    const head = safe.slice(0, buffer);
    const tail = safe.slice(-buffer);
    return [...tail, ...safe, ...head];
  }, [items]);

  const realLen = items?.length || 0;
  const buffer = Math.min(5, realLen);

  // arrancamos al “primer real” dentro del extended
  const [index, setIndex] = useState(() => (realLen > 1 ? buffer : 0));
  const [withTransition, setWithTransition] = useState(true);

  const slidesPerView = useMemo(() => getSlidesPerView(vw), [vw]);

  const gap = 20; // como en el snippet
  const slideW = useMemo(() => {
    const w = Math.max(320, containerW || 1200);
    return Math.floor((w - gap * (slidesPerView - 1)) / slidesPerView);
  }, [containerW, slidesPerView]);

  // Observers: ancho contenedor + viewport
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

    // init
    setContainerW(el.clientWidth);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  // Autoplay
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

  // Corrección de loop (cuando caemos en clones)
  useEffect(() => {
    if (realLen <= 1) return;

    const onEnd = () => {
      // Si nos movimos a la zona de clones de la derecha
      // “real” está entre [buffer .. buffer+realLen-1]
      const minReal = buffer;
      const maxReal = buffer + realLen - 1;

      if (index > maxReal) {
        // saltar sin transición al inicio real equivalente
        setWithTransition(false);
        setIndex(minReal);
      } else if (index < minReal) {
        // saltar sin transición al final real equivalente
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
  }, [extended.length]);

  const translateX = useMemo(() => {
    return -(index * (slideW + gap));
  }, [index, slideW]);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-12">
        {/* TITULO + DESCRIPCIÓN */}
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
          {/* Viewport */}
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
                    : "https://via.placeholder.com/600x600?text=Brak+obrazka";

                return (
                  <div
                    key={`${it.id}-${i}`}
                    className="shrink-0 text-center"
                    style={{ width: `${slideW}px` }}
                  >
                    <Link href={it.href} className="block select-none">
                      <div className="relative w-full aspect-square overflow-hidden bg-transparent">
                        <Image
                          src={imgSrc}
                          alt={it.name}
                          fill
                          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, (max-width: 1400px) 33vw, 240px"
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

          {/* Flechas (mismo look simple del back) */}
          <button
            type="button"
            aria-label="Poprzednie"
            onClick={() => {
              setIsPaused(true);
              prev();
              setTimeout(() => setIsPaused(false), 1200);
            }}
            className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/90 border border-black/10
                       flex items-center justify-center text-2xl text-black/70
                       hover:bg-white"
          >
            ›
          </button>

          <button
            type="button"
            aria-label="Następne"
            onClick={() => {
              setIsPaused(true);
              next();
              setTimeout(() => setIsPaused(false), 1200);
            }}
            className="absolute -left-2.5 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/90 border border-black/10
                       flex items-center justify-center text-2xl text-black/70
                       hover:bg-white"
          >
            ‹
          </button>
        </div>

        {/* BOTÓN (como la captura: fondo #c9b086 + texto blanco forzado) */}
        <div className="mt-10 flex justify-center">
          <Link
            href={buttonHref}
            className={[
              "inline-flex items-center justify-center",
              "bg-[#c9b086]",
              "px-12 py-3", // un poco más ancho como en la captura
              "text-sm font-semibold tracking-wide uppercase",
              "text-white!", // ✅ fuerza blanco incluso si estilos globales pisan <a>
              "hover:opacity-95",
              "focus:outline-none focus:ring-2 focus:ring-[#c9b086]/40",
            ].join(" ")}
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
