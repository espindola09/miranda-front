"use client";

import React, { useMemo, useState } from "react";

type Img = { id?: number; src: string; alt?: string };

type Props = {
  productName: string;
  images: Img[];

  maxWidthCm: number;
  maxHeightCm: number;

  defaultWidthCm?: number;
  defaultHeightCm?: number;

  // panel width cap (100cm por panel)
  maxPanelWidthCm?: number;

  // Price + CTA (del server)
  priceHtml?: string;
  fallbackPrice?: string;

  // Right-side info
  shortDescriptionHtml?: string;
  descriptionHtml?: string;

  // Meta chips
  sku?: string | null;
  stockStatus?: string | null;
  categoryName?: string | null;
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Íconos inline
function IconFlipX() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 7h2v10H7V7Zm8.5 0L21 12l-5.5 5v-3H11v-4h4.5V7ZM3 12l5.5-5v3H13v4H8.5v3L3 12Z"
      />
    </svg>
  );
}

function IconFlipY() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 7h10v2H7V7Zm0 8h10v2H7v-2Zm5-12 5 5h-3.5V12h-3V8H7l5-5Zm0 18-5-5h3.5V12h3v4H17l-5 5Z"
      />
    </svg>
  );
}

function IconZoom() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 18a8 8 0 1 1 5.29-14.01A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0-6-6a6 6 0 0 0 6 6Zm11 5-5.2-5.2 1.4-1.4L22.4 19.6 21 21Zm-12-9h2V9h2V7h-2V5H9v2H7v2h2v3Z"
      />
    </svg>
  );
}

export default function FototapetyProductClient({
  productName,
  images,
  maxWidthCm,
  maxHeightCm,
  defaultWidthCm = 70,
  defaultHeightCm = 100,
  maxPanelWidthCm = 100,
  priceHtml,
  fallbackPrice,
  shortDescriptionHtml,
  descriptionHtml,
  sku,
  stockStatus,
  categoryName,
}: Props) {
  // Imagen seleccionada (thumbs)
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images?.[activeIdx]?.src || "";

  // Transformaciones (flip/zoom)
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Medidas input (✅ ahora viven acá y se renderizan a la DERECHA)
  const [w, setW] = useState<number>(defaultWidthCm);
  const [h, setH] = useState<number>(defaultHeightCm);

  const maxW = Number.isFinite(maxWidthCm) && maxWidthCm > 0 ? maxWidthCm : 0;
  const maxH = Number.isFinite(maxHeightCm) && maxHeightCm > 0 ? maxHeightCm : 0;

  const wClamped = useMemo(() => {
    const upper = maxW > 0 ? maxW : 9999;
    return clamp(Number(w || 0), 1, upper);
  }, [w, maxW]);

  const hClamped = useMemo(() => {
    const upper = maxH > 0 ? maxH : 9999;
    return clamp(Number(h || 0), 1, upper);
  }, [h, maxH]);

  const areaM2 = useMemo(
    () => round2((wClamped * hClamped) / 10000),
    [wClamped, hClamped]
  );

  const panels = useMemo(() => {
    const panelCount = Math.max(1, Math.ceil(wClamped / maxPanelWidthCm));
    const panelWidth = Math.round(wClamped / panelCount);
    return { panelCount, panelWidth };
  }, [wClamped, maxPanelWidthCm]);

  const onReset = () => {
    setFlipX(false);
    setFlipY(false);
    setZoom(1);
    setW(defaultWidthCm);
    setH(defaultHeightCm);
  };

  const cycleZoom = () => {
    setZoom((z) => {
      if (z < 1.5) return 1.5;
      if (z < 2) return 2;
      return 1;
    });
  };

  const transform = `scale(${zoom}) scaleX(${flipX ? -1 : 1}) scaleY(${
    flipY ? -1 : 1
  })`;

  const stockLabel =
    stockStatus === "instock" ? "Dostępny" : stockStatus || "";

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {/* =========================
          IZQUIERDA: imagen + botones + thumbs + barra
         ========================= */}
      <section className="self-start">
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          {active ? (
            <div className="relative">
              <img
                src={active}
                alt={productName}
                className="w-full h-auto block object-cover origin-center"
                style={{ transform }}
                loading="eager"
              />
            </div>
          ) : (
            <div className="p-14 text-white/50">No image</div>
          )}
        </div>

        {/* ✅ CONTROLES DEBAJO de la imagen (no absolute) */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFlipX((v) => !v)}
            className="h-9 w-9 rounded-md bg-[#c9b086] text-black hover:opacity-90 transition grid place-items-center shadow"
            aria-label="Odwróć w poziomie"
            title="Odwróć w poziomie"
          >
            <IconFlipX />
          </button>

          <button
            type="button"
            onClick={() => setFlipY((v) => !v)}
            className="h-9 w-9 rounded-md bg-[#c9b086] text-black hover:opacity-90 transition grid place-items-center shadow"
            aria-label="Odwróć w pionie"
            title="Odwróć w pionie"
          >
            <IconFlipY />
          </button>

          <button
            type="button"
            onClick={cycleZoom}
            className="h-9 w-9 rounded-md bg-[#c9b086] text-black hover:opacity-90 transition grid place-items-center shadow"
            aria-label="Powiększ"
            title="Powiększ"
          >
            <IconZoom />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="h-9 rounded-md px-3 bg-white/10 border border-white/15 text-white hover:bg-white/15 transition shadow"
          >
            Reset
          </button>
        </div>

        {/* THUMBS */}
        {images?.length > 1 ? (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {images.slice(0, 5).map((img: any, idx: number) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={img.id ?? `${img.src}-${idx}`}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={[
                    "rounded-xl overflow-hidden border bg-white/5",
                    isActive ? "border-[#c9b086]" : "border-white/10",
                  ].join(" ")}
                  title={img.alt || productName}
                >
                  <img
                    src={img.src}
                    alt={img.alt || productName}
                    className="w-full h-16 block object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        ) : null}

        {/* BARRA INFO */}
        <div className="mt-4 rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-white/90">
          <span className="font-semibold">Powierzchnia:</span>{" "}
          {areaM2.toFixed(2)} m² <span className="text-white/40">|</span>{" "}
          <span className="font-semibold">Wymiary:</span> {wClamped}x{hClamped} cm{" "}
          <span className="text-white/40">|</span>{" "}
          <span className="font-semibold">Bryty:</span> {panels.panelCount} x{" "}
          {panels.panelWidth} cm
        </div>
      </section>

      {/* =========================
          DERECHA: título más chico + inputs + precio + CTA + descripciones
         ========================= */}
      <section className="min-w-0">
        {/* ✅ TÍTULO más chico */}
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {productName}
        </h1>

        {/* Meta rápida */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {sku ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
              SKU: {sku}
            </span>
          ) : null}

          {stockStatus ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
              Stan: {stockLabel}
            </span>
          ) : null}

          {categoryName ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
              Kategoria: {categoryName}
            </span>
          ) : null}
        </div>

        {/* ✅ DIMENSIONES a la DERECHA */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-white/80 mb-2">
              Szerokość (cm) <span className="text-red-400">*</span>
            </label>
            <input
              value={String(w)}
              onChange={(e) => setW(Number(e.target.value))}
              onBlur={() => setW(wClamped)}
              inputMode="numeric"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/20"
              placeholder={String(defaultWidthCm)}
            />
            <div className="mt-2 text-xs text-white/60">
              Max: {maxW > 0 ? `${maxW} cm` : "—"}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">
              Wysokość (cm) <span className="text-red-400">*</span>
            </label>
            <input
              value={String(h)}
              onChange={(e) => setH(Number(e.target.value))}
              onBlur={() => setH(hClamped)}
              inputMode="numeric"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/20"
              placeholder={String(defaultHeightCm)}
            />
            <div className="mt-2 text-xs text-white/60">
              Max: {maxH > 0 ? `${maxH} cm` : "—"}
            </div>
          </div>
        </div>

        {/* Descripción corta */}
        {shortDescriptionHtml ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div
              className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
            />
          </div>
        ) : null}

        {/* ✅ PRECIO sin leyendas y ARRIBA del CTA */}
        <div className="mt-6">
          {priceHtml ? (
            <div
              className="text-2xl md:text-3xl font-semibold text-white/90"
              dangerouslySetInnerHTML={{ __html: priceHtml }}
            />
          ) : (
            <p className="text-2xl md:text-3xl font-semibold text-white/90">
              {fallbackPrice || ""}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="rounded-2xl bg-white text-black font-semibold px-5 py-3 hover:bg-white/90 transition"
          >
            Dodaj do koszyka
          </button>
          <button
            type="button"
            className="rounded-2xl border border-white/15 bg-white/5 text-white font-semibold px-5 py-3 hover:bg-white/10 transition"
          >
            Dodaj do ulubionych
          </button>
        </div>

        {/* Descripción larga */}
        {descriptionHtml ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white/90 mb-3">Opis</h2>
            <div
              className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
