"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type Img = { id?: number; src: string; alt?: string };

type Props = {
  productName: string;
  images: Img[];

  maxWidthCm: number;
  maxHeightCm: number;

  defaultWidthCm?: number;
  defaultHeightCm?: number;

  maxPanelWidthCm?: number;

  priceHtml?: string;
  fallbackPrice?: string;

  shortDescriptionHtml?: string;
  descriptionHtml?: string;

  sku?: string | null;
  stockStatus?: string | null;
  categoryName?: string | null;

  // ✅ NUEVO (para mostrar TODAS las categorías debajo del CTA como en Woo)
  categoryNames?: string[] | null;
};

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function buildCleanPriceHtml(raw?: string) {
  if (!raw) return "";

  const delMatch = raw.match(/<del[^>]*>([\s\S]*?)<\/del>/i);
  const insMatch = raw.match(/<ins[^>]*>([\s\S]*?)<\/ins>/i);

  if (delMatch && insMatch) {
    const delInner = (delMatch[1] || "").trim();
    const insInner = (insMatch[1] || "").trim();

    if (delInner && insInner) {
      return `
        <del class="opacity-60 mr-2">${delInner}</del>
        <ins class="no-underline">${insInner}</ins>
      `.trim();
    }
  }

  const amountMatch = raw.match(
    /<span[^>]*class="[^"]*\bamount\b[^"]*"[^>]*>[\s\S]*?<\/span>/i
  );
  if (amountMatch?.[0]) return amountMatch[0].trim();

  const bdiMatch = raw.match(/<bdi[^>]*>[\s\S]*?<\/bdi>/i);
  if (bdiMatch?.[0]) return bdiMatch[0].trim();

  return "";
}

type Material = {
  id: string;
  name: string;
  desc: string;
  image?: string;
};

const MATERIALS: Material[] = [
  {
    id: "flizelina-170g",
    name: "Flizelinowa Gładka 170g",
    desc: "WSTAW TU OPIS 1 (dokładnie jak w Twoich materiałach).",
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2024/12/1-lateksowa-600x400-1.webp",
  },
  {
    id: "flizelina-premium-220g",
    name: "Flizelinowa Gładka PREMIUM 220g",
    desc: "WSTAW TU OPIS 2.",
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2024/12/2-flizelinowa-premium-600x400-1.webp",
  },
  {
    id: "winyl-beton-360g",
    name: "Winyl na flizelinie beton 360g",
    desc: "WSTAW TU OPIS 3.",
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2024/12/2-flizelinowa-premium-600x400-1.webp",
  },
  {
    id: "winyl-strukturalna-360g",
    name: "Winylowa na flizelinie strukturalna 360g",
    desc: "WSTAW TU OPIS 4.",
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2024/12/2-flizelinowa-premium-600x400-1.webp",
  },
  {
    id: "samoprzylepna",
    name: "Samoprzylepna",
    desc: "WSTAW TU OPIS 5.",
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2024/12/2-flizelinowa-premium-600x400-1.webp",
  },
  {
    id: "brush-360g",
    name: "Winylowa na flizelinie strukturalna BRUSH 360g",
    desc: "WSTAW TU OPIS 6.",
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2024/12/2-flizelinowa-premium-600x400-1.webp",
  },
];

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

type EffectId = "none" | "sepia" | "bw";
function effectToCssFilter(effect: EffectId): string {
  if (effect === "sepia") return "sepia(1)";
  if (effect === "bw") return "grayscale(1)";
  return "none";
}

function InfoIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#2f6fff] text-[#2f6fff] text-[10px] font-bold leading-none"
    >
      ?
    </span>
  );
}

function joinCategories(categoryNames?: string[] | null) {
  if (!Array.isArray(categoryNames)) return "";
  const cleaned = categoryNames
    .map((s) => String(s || "").trim())
    .filter(Boolean);
  return cleaned.length ? Array.from(new Set(cleaned)).join(", ") : "";
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
  categoryNames,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images?.[activeIdx]?.src || "";

  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [effect, setEffect] = useState<EffectId>("none");
  const imageFilter = useMemo(() => effectToCssFilter(effect), [effect]);

  const [drukPremium, setDrukPremium] = useState(false);
  const [klejDoTapet, setKlejDoTapet] = useState(false);

  const [w, setW] = useState<number>(defaultWidthCm);
  const [h, setH] = useState<number>(defaultHeightCm);

  const maxW = useMemo(() => {
    const n = Number(maxWidthCm);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [maxWidthCm]);

  const maxH = useMemo(() => {
    const n = Number(maxHeightCm);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [maxHeightCm]);

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
    const safeMaxPanel = Number.isFinite(maxPanelWidthCm) && maxPanelWidthCm > 0
      ? maxPanelWidthCm
      : 100;

    const panelCount = Math.max(1, Math.ceil(wClamped / safeMaxPanel));
    const panelWidth = Math.round(wClamped / panelCount);
    return { panelCount, panelWidth };
  }, [wClamped, maxPanelWidthCm]);

  const onReset = () => {
    setFlipX(false);
    setFlipY(false);
    setZoom(1);
    setEffect("none");
    setDrukPremium(false);
    setKlejDoTapet(false);
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

  const transform = useMemo(() => {
    return `scale(${zoom}) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`;
  }, [zoom, flipX, flipY]);

  const stockLabel = useMemo(() => {
    return stockStatus === "instock" ? "Dostępny" : stockStatus || "";
  }, [stockStatus]);

  const cleanPriceHtml = useMemo(
    () => buildCleanPriceHtml(priceHtml),
    [priceHtml]
  );

  const [materialOpen, setMaterialOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    MATERIALS[0]?.id || ""
  );

  const selectedMaterial = useMemo(() => {
    return MATERIALS.find((m) => m.id === selectedMaterialId) || MATERIALS[0];
  }, [selectedMaterialId]);

  React.useEffect(() => {
    if (!materialOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMaterialOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [materialOpen]);

  // ✅ Link a la próba con el SKU actual (si existe)
  const sampleHref = useMemo(() => {
    const s = String(sku || "").trim();
    return s.length > 0
      ? `/produkt/probka-fototapety?ref_sku=${encodeURIComponent(s)}`
      : `/produkt/probka-fototapety`;
  }, [sku]);

  // ✅ Categorías completas (para bloque debajo CTA, como Woo)
  const categoriesText = useMemo(() => joinCategories(categoryNames), [
    categoryNames,
  ]);

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {/* IZQUIERDA */}
      <section className="self-start">
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          {active ? (
            <div className="relative">
              <img
                src={active}
                alt={productName}
                className="w-full h-auto block object-cover origin-center"
                style={{ transform, filter: imageFilter }}
                loading="eager"
              />
            </div>
          ) : (
            <div className="p-14 text-white/50">No image</div>
          )}
        </div>

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
                    style={{ filter: imageFilter }}
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-4 rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-white/90">
          <span className="font-semibold">Powierzchnia:</span>{" "}
          {areaM2.toFixed(2)} m² <span className="text-white/40">|</span>{" "}
          <span className="font-semibold">Wymiary:</span> {wClamped}x{hClamped} cm{" "}
          <span className="text-white/40">|</span>{" "}
          <span className="font-semibold">Bryty:</span> {panels.panelCount} x{" "}
          {panels.panelWidth} cm
        </div>
      </section>

      {/* DERECHA */}
      <section className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {productName}
        </h1>

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

        {/* MATERIAL */}
        <div className="mt-6">
          <label className="block text-sm text-white/80 mb-2">Materiał</label>

          <button
            type="button"
            onClick={() => setMaterialOpen(true)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-left hover:border-white/20 transition flex items-center justify-between gap-3"
          >
            <span className="text-white/90">
              {selectedMaterial?.name || "Wybierz materiał"}
            </span>

            <span className="text-white/60 text-sm">Zmień</span>
          </button>

          {selectedMaterial?.desc ? (
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              {selectedMaterial.desc.length > 160
                ? selectedMaterial.desc.slice(0, 160) + "…"
                : selectedMaterial.desc}
            </p>
          ) : null}
        </div>

        {/* EFEKTY + ADDONS */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="min-w-0">
            <label className="block text-sm text-white/80 mb-2">Efekty</label>
            <select
              value={effect}
              onChange={(e) => setEffect(e.target.value as EffectId)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/20 text-white"
            >
              <option value="none" className="bg-black">
                Brak
              </option>
              <option value="sepia" className="bg-black">
                Sepia
              </option>
              <option value="bw" className="bg-black">
                Czarno - Białe
              </option>
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-sm text-white/80 mb-2">
              Druk Premium
            </label>
            <label className="mt-0.5 inline-flex items-center gap-2 text-sm text-white/80 select-none">
              <input
                type="checkbox"
                checked={drukPremium}
                onChange={(e) => setDrukPremium(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#2f6fff]"
              />
              <span className="whitespace-nowrap">10zł / m2</span>
              <span className="translate-y-px">
                <InfoIcon />
              </span>
            </label>
          </div>

          <div className="min-w-0">
            <label className="block text-sm text-white/80 mb-2">
              Klej do tapet
            </label>
            <label className="mt-0.5 inline-flex items-center gap-2 text-sm text-white/80 select-none">
              <input
                type="checkbox"
                checked={klejDoTapet}
                onChange={(e) => setKlejDoTapet(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#2f6fff]"
              />
              <span className="whitespace-nowrap">39.00 zł</span>
              <span className="translate-y-px">
                <InfoIcon />
              </span>
            </label>
          </div>
        </div>

        {/* SHORT DESCRIPTION */}
        {shortDescriptionHtml ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div
              className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
            />
          </div>
        ) : null}

        {/* PRECIO */}
        <div className="mt-6">
          {cleanPriceHtml ? (
            <div
              className="text-lg md:text-xl font-semibold text-white/90"
              dangerouslySetInnerHTML={{ __html: cleanPriceHtml }}
            />
          ) : (
            <p className="text-lg md:text-xl font-semibold text-white/90">
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

        {/* ✅ SKU + categorías completas debajo del CTA (como Woo) */}
        {(String(sku || "").trim() || categoriesText) ? (
          <div className="mt-4 text-sm text-white/80 space-y-1">
            {String(sku || "").trim() ? (
              <div>
                <span className="font-semibold">SKU:</span>{" "}
                {String(sku || "").trim()}
              </div>
            ) : null}

            {categoriesText ? (
              <div>
                <span className="font-semibold">Kategorie:</span>{" "}
                <span className="text-white/70">{categoriesText}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ✅ LINK A PRÓBKA (como el sitio actual) */}
        <div className="mt-3 text-xs text-white/60">
          Możesz uzyskać naszą próbkę fototapety pod tym linkiem:{" "}
          <Link
            href={sampleHref}
            className="text-[#c9b086] hover:underline font-semibold"
          >
            Próbka Fototapety 29.00zł
          </Link>
        </div>

        {/* LONG DESCRIPTION */}
        {descriptionHtml ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white/90 mb-3">Opis</h2>
            <div
              className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        ) : null}

        {/* POPUP MATERIAL */}
        {materialOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onMouseDown={() => setMaterialOpen(false)}
          >
            <div
              className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl overflow-hidden"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-semibold text-white/90">
                    Wybierz materiał
                  </h3>
                  <p className="text-sm text-white/60">
                    Kliknij materiał, aby wybrać i zobaczyć opis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMaterialOpen(false)}
                  className="rounded-lg px-3 py-2 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition"
                >
                  Zamknij
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                <div className="space-y-2">
                  {MATERIALS.map((m) => {
                    const isActive = m.id === selectedMaterialId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMaterialId(m.id)}
                        className={[
                          "w-full text-left rounded-xl border px-4 py-3 transition",
                          isActive
                            ? "border-[#c9b086] bg-white/10"
                            : "border-white/10 bg-white/5 hover:border-white/20",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white/10 border border-white/10 overflow-hidden shrink-0">
                            {m.image ? (
                              <img
                                src={m.image}
                                alt={m.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-white/90 truncate">
                              {m.name}
                            </div>
                            <div className="text-xs text-white/60 truncate">
                              Kliknij, aby zobaczyć opis
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/10 overflow-hidden shrink-0">
                      {selectedMaterial?.image ? (
                        <img
                          src={selectedMaterial.image}
                          alt={selectedMaterial.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white/90">
                        {selectedMaterial?.name}
                      </div>
                      <div className="text-sm text-white/60">
                        Klej do tapet • maksymalna szerokość brytu 100 cm
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-white/80 leading-relaxed whitespace-pre-line">
                    {selectedMaterial?.desc || "Brak opisu."}
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setMaterialOpen(false)}
                      className="rounded-xl px-4 py-2 bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
                    >
                      Anuluj
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaterialOpen(false)}
                      className="rounded-xl px-4 py-2 bg-[#c9b086] text-black font-semibold hover:opacity-90 transition"
                    >
                      Wybierz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
