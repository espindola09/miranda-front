"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";

/* ✅ NUEVO: overlay de recorte (drag + bryty) */
import FototapetyCropOverlay from "@/components/fototapety/FototapetyCropOverlay";

/* ✅ ULUBIONE — usar el MISMO botón que el resto */
import UlubioneHeartButton from "@/components/ulubione/UlubioneHeartButton";

type Img = { id?: number; src: string; alt?: string };

export type AdditionalInfoRow = {
  label: string;
  value: string;
};

type Props = {
  // ✅ NUEVO (opcional, para wishlist). NO rompe nada si no lo pasas aún.
  productId?: number;
  productSlug?: string;

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

  // ✅ Para mostrar TODAS las categorías debajo del CTA como en Woo
  categoryNames?: string[] | null;

  // ✅ NUEVO: filas para "Informacje dodatkowe"
  additionalInfo?: AdditionalInfoRow[] | null;

  // ✅ NUEVO: “Średnia cena z ostatnich 30 dni …” desde el back
  avgPrice30DaysText?: string | null;
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
  subtitle: string; // ✅ subtítulo corto
  desc: string; // ✅ cuerpo
  features: string[]; // ✅ lista de “Cechy materiału”
  image?: string;
};

const MATERIALS: Material[] = [
  {
    id: "flizelina-170g",
    name: "Flizelinowa Gładka 180g",
    subtitle: "Uniwersalna i lekka fototapeta do codziennych wnętrz",
    desc:
      "Klasyczna tapeta flizelinowa o gładkiej, matowej powierzchni. Dobra jakość w atrakcyjnej cenie, idealna do mieszkań, biur i przestrzeni o umiarkowanym użytkowaniu.",
    features: [
      "Wykończenie: matowe",
      "Struktura: gładka",
      "Gramatura: 170 g/m²",
      "Podkład: flizelinowy",
      "Zmywalna i odporna na zabrudzenia",
      "Certyfikat trudnopalności",
      "Atest higieniczny",
      "Pasowanie brytów: stykowo",
      "Maks. szerokość brytu: 100 cm",
    ],
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2026/01/Flizelinowa-Gladka-180g.webp",
  },
  {
    id: "flizelina-premium-220g",
    name: "Flizelinowa Gładka PREMIUM 220g",
    subtitle: "Wyższa gramatura, lepsza trwałość i jakość druku",
    desc:
      "Wersja premium tapety flizelinowej, przeznaczona do bardziej wymagających realizacji. Grubszy materiał zapewnia lepsze krycie ściany oraz bardziej elegancki efekt końcowy.",
    features: [
      "Wykończenie: matowe",
      "Struktura: gładka",
      "Gramatura: 220 g/m²",
      "Podkład: flizelinowy",
      "Zmywalna",
      "Odporna na zabrudzenia",
      "Certyfikat trudnopalności",
      "Atest higieniczny",
      "Pasowanie brytów: stykowo",
      "Maks. szerokość brytu: 100 cm",
    ],
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2026/01/Flizelinowa-Gladka-PREMIUM-220g.webp",
  },
  {
    id: "winyl-beton-360g",
    name: "Winyl na flizelinie CONCRETE 350g",
    subtitle: "Wyrazista struktura betonu i najwyższa trwałość",
    desc:
      "Tapeta winylowa o realistycznej strukturze betonu. Bardzo trwała i odporna, polecana do nowoczesnych wnętrz oraz przestrzeni komercyjnych.",
    features: [
      "Wykończenie: matowe",
      "Struktura: beton",
      "Gramatura: ok. 360 g/m²",
      "Podkład: flizelinowy",
      "Wysoka odporność na zabrudzenia",
      "100% ekologiczna",
      "Certyfikat trudnopalności",
      "Atest higieniczny",
      "Pasowanie brytów: stykowo",
      "Maks. szerokość brytu: 100 cm",
    ],
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2026/01/Winyl-na-flizelinie-CONCRETE-350g.webp",
  },
  {
    id: "winyl-linen-360g",
    name: "Winyl na flizelinie COTTON 350g",
    subtitle: "Elegancka struktura płótna – wybór projektantów wnętrz",
    desc:
      "Tapeta winylowa o strukturze płótna malarskiego (canvas). Bardzo popularna w aranżacjach premium, nadaje wnętrzom miękkości i elegancji.",
    features: [
      "Wykończenie: matowe",
      "Struktura: linen / canvas",
      "Gramatura: ok. 360 g/m²",
      "Podkład: flizelinowy",
      "100% ekologiczna",
      "Uniwersalne zastosowanie",
      "Certyfikat trudnopalności",
      "Atest higieniczny",
      "Pasowanie brytów: stykowo",
      "Maks. szerokość brytu: 100 cm",
    ],
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2026/01/Winyl-na-flizelinie-COTTON-350g.webp",
  },
  {
    id: "brush-360g",
    name: "Winyl na flizelinie PAINT 350g",
    subtitle: "Dynamiczna faktura pociągnięcia pędzla",
    desc:
      "Tapeta winylowa o wyczuwalnej strukturze pędzla, która dodaje ścianie głębi i artystycznego charakteru. Często wybierana do nowoczesnych i designerskich wnętrz.",
    features: [
      "Wykończenie: matowe",
      "Struktura: pociągnięcie pędzla",
      "Gramatura: ok. 360 g/m²",
      "Podkład: flizelinowy",
      "100% ekologiczna",
      "Uniwersalne zastosowanie",
      "Certyfikat trudnopalności",
      "Atest higieniczny",
      "Pasowanie brytów: stykowo",
      "Maks. szerokość brytu: 100 cm",
    ],
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2026/01/Winyl-na-flizelinie-PAINT-350g.webp",
  },
  {
    id: "samoprzylepna",
    name: "Samoprzylepna CANVAS 250g",
    subtitle: "Szybki montaż bez kleju – idealna na gładkie powierzchnie",
    desc:
      "Fototapeta z warstwą samoprzylepną, przeznaczona do idealnie gładkich podłoży. Prosty i szybki montaż bez użycia kleju. Nie zaleca się aplikacji na farby lateksowe i zmywalne.",
    features: [
      "Wykończenie: matowe",
      "Struktura: gładka",
      "Podkład: samoprzylepny",
      "100% ekologiczna",
      "Certyfikat trudnopalności",
      "Atest higieniczny",
      "Pasowanie brytów: zakładka ± 0,5 cm",
      "Maks. szerokość brytu: 100 cm",
    ],
    image:
      "https://drukdekoracje.pl/wp-content/uploads/2026/01/Samoprzylepna-CANVAS-250g.webp",
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

function IconSearchPlus() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 18a8 8 0 1 1 5.29-14.01A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0-6-6a6 6 0 0 0 6 6Zm11 5-5.2-5.2 1.4-1.4L22.4 19.6 21 21ZM10 7h2v2h2v2h-2v2h-2v-2H8V9h2V7Z"
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

/* --------------------------- Stepper Input (flechas DENTRO del input) -------------------------- */

function StepperInput({
  value,
  onChange,
  onBlur,
  min = 1,
  max = 9999,
  placeholder,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  placeholder?: string;
  ariaLabel: string;
}) {
  const safeValue = Number.isFinite(value) ? value : min;

  const setClamped = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange(clamped);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        inputMode="numeric"
        value={String(safeValue)}
        onChange={(e) => {
          const raw = e.target.value;

          if (raw.trim() === "") {
            onChange(min);
            return;
          }

          const onlyDigits = raw.replace(/[^\d]/g, "");
          if (onlyDigits === "") {
            onChange(min);
            return;
          }

          const n = Number(onlyDigits);
          if (Number.isFinite(n)) onChange(n);
        }}
        onBlur={onBlur}
        className="w-full rounded-xl bg-white border border-black/15 px-4 py-3 outline-none focus:border-[#c9b086] text-black placeholder:text-black/40"
        style={{
          paddingRight: 52, // ✅ espacio reservado para flechas (DENTRO)
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />

      {/* ✅ Flechas absolutamente posicionadas dentro del input */}
      <div
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.12)",
          background: "rgba(0,0,0,0.03)",
        }}
      >
        <button
          type="button"
          aria-label="Increase"
          onClick={() => setClamped(safeValue + 1)}
          className="grid place-items-center text-black/70 hover:text-black transition"
          style={{
            height: 18,
            width: 28,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 10, transform: "translateY(0px)" }}>▲</span>
        </button>

        <div style={{ height: 1, background: "rgba(0,0,0,0.12)" }} />

        <button
          type="button"
          aria-label="Decrease"
          onClick={() => setClamped(safeValue - 1)}
          className="grid place-items-center text-black/70 hover:text-black transition"
          style={{
            height: 18,
            width: 28,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 10, transform: "translateY(-1px)" }}>▼</span>
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Trust Bar UI -------------------------- */

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 20 6v6c0 5-3.6 9.4-8 10-4.4-.6-8-5-8-10V6l8-4Zm0 2.2L6 7v5c0 3.9 2.7 7.5 6 8 3.3-.5 6-4.1 6-8V7l-6-2.8Z"
      />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 7h11v9H3V7Zm12 2h3l3 3v4h-2.1a2.5 2.5 0 0 1-4.8 0H15V9Zm1.5 2v3h3.2v-1.2L18 11h-1.5ZM7.5 19a2.5 2.5 0 0 1-2.45-2H14a2.5 2.5 0 0 1-4.9 0H7.5Zm10 0a2.5 2.5 0 0 1-2.45-2h4.9a2.5 2.5 0 0 1-2.45 2Z"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 3v5.2l4 2.3-1 1.7-5-2.9V7h2Z"
      />
    </svg>
  );
}

function normalizeAvgText(input?: string | null) {
  const s = String(input || "").trim();
  if (!s) return "";
  if (/średnia cena/i.test(s)) return s;

  const maybe = s.replace(",", ".").replace(/[^\d.]/g, "");
  const num = Number(maybe);
  if (Number.isFinite(num) && num > 0) {
    const formatted = num.toFixed(2);
    return `Średnia cena z ofert z ostatnich 30 dni: ${formatted} zł`;
  }
  return s;
}

function ProductTrustBar({ avgText }: { avgText?: string | null }) {
  const line = normalizeAvgText(avgText);

  return (
    <div className="mt-4">
      {line ? <div className="text-xs text-black/60">{line}</div> : null}

      <div className="mt-3 border-t border-black/10" />

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-[11px] text-black/60">
        <div className="flex items-center gap-2">
          <span className="text-[#c9b086]">
            <IconShield />
          </span>
          <span>Kupujesz bezpiecznie: Polski i ekologiczny produkt.</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#c9b086]">
            <IconTruck />
          </span>
          <span>Darmowa dostawa przy zakupach powyżej 699zł.</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#c9b086]">
            <IconClock />
          </span>
          <span>Czas realizacji od 2 do 5 dni roboczych.</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- main ------------------------------ */

export default function FototapetyProductClient({
  productId,
  productSlug,
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
  additionalInfo,
  avgPrice30DaysText,
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
    const safeMaxPanel =
      Number.isFinite(maxPanelWidthCm) && maxPanelWidthCm > 0
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
    return `scale(${zoom}) scaleX(${flipX ? -1 : 1}) scaleY(${
      flipY ? -1 : 1
    })`;
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

  const sampleHref = useMemo(() => {
    const s = String(sku || "").trim();
    return s.length > 0
      ? `/produkt/probka-fototapety?ref_sku=${encodeURIComponent(s)}`
      : `/produkt/probka-fototapety`;
  }, [sku]);

  const categoriesText = useMemo(
    () => joinCategories(categoryNames),
    [categoryNames]
  );

  const [tab, setTab] = useState<"opis" | "info">("opis");
  const additionalRows = Array.isArray(additionalInfo) ? additionalInfo : [];

  const wishlistId = useMemo(() => {
    const n = Number(productId || 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [productId]);

  const mainImageForWishlist = useMemo(() => {
    const url = images?.[0]?.src || "";
    return String(url || "");
  }, [images]);

  const heartBtnRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {/* IZQUIERDA */}
      <section className="self-start">
        <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-lg">
          {active ? (
            <div className="relative w-full overflow-hidden">
              {/* ✅ Wrapper para que el overlay se alinee visualmente con transform+filter */}
              <div
                className="relative w-full"
                style={{
                  transform,
                  transformOrigin: "center",
                  filter: imageFilter,
                }}
              >
                <img
                  src={active}
                  alt={productName}
                  className="w-full h-auto block object-cover origin-center select-none pointer-events-none"
                  loading="eager"
                  draggable={false}
                />

                {/* ✅ RECORTE: ratio = w/h, bryty = maxPanelWidthCm, drag */}
                <FototapetyCropOverlay
                  widthCm={wClamped}
                  heightCm={hClamped}
                  maxPanelWidthCm={maxPanelWidthCm}
                />
              </div>
            </div>
          ) : (
            <div className="p-14 text-black/50">No image</div>
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
            className="h-9 rounded-md px-3 bg-white border border-black/10 text-black hover:bg-black/5 transition shadow"
          >
            Reset
          </button>
        </div>

        {images?.length > 1 ? (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {images.slice(0, 5).map((img: any, idx: number) => {
              const isActiveThumb = idx === activeIdx;
              return (
                <button
                  key={img.id ?? `${img.src}-${idx}`}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={[
                    "rounded-xl overflow-hidden border bg-white",
                    isActiveThumb ? "border-[#c9b086]" : "border-black/10",
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

        <div className="mt-4 rounded-xl bg-white border border-black/10 px-4 py-3 text-sm text-black/80">
          <span className="font-semibold text-black">Powierzchnia:</span>{" "}
          {areaM2.toFixed(2)} m² <span className="text-black/30">|</span>{" "}
          <span className="font-semibold text-black">Wymiary:</span>{" "}
          {wClamped}x{hClamped} cm <span className="text-black/30">|</span>{" "}
          <span className="font-semibold text-black">Bryty:</span>{" "}
          {panels.panelCount} x {panels.panelWidth} cm
        </div>
      </section>

      {/* DERECHA */}
      <section className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight text-black">
          {productName}
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-black/80 mb-2">
              Szerokość (cm) <span className="text-red-500">*</span>
            </label>

            <StepperInput
              value={w}
              onChange={(next) => setW(next)}
              onBlur={() => setW(wClamped)}
              min={1}
              max={maxW > 0 ? maxW : 9999}
              placeholder={String(defaultWidthCm)}
              ariaLabel="Szerokość (cm)"
            />

            <div className="mt-2 text-xs text-black/60">
              Max: {maxW > 0 ? `${maxW} cm` : "—"}
            </div>
          </div>

          <div>
            <label className="block text-sm text-black/80 mb-2">
              Wysokość (cm) <span className="text-red-500">*</span>
            </label>

            <StepperInput
              value={h}
              onChange={(next) => setH(next)}
              onBlur={() => setH(hClamped)}
              min={1}
              max={maxH > 0 ? maxH : 9999}
              placeholder={String(defaultHeightCm)}
              ariaLabel="Wysokość (cm)"
            />

            <div className="mt-2 text-xs text-black/60">
              Max: {maxH > 0 ? `${maxH} cm` : "—"}
            </div>
          </div>
        </div>

        {/* MATERIAL */}
        <div className="mt-6">
          <label className="block text-sm text-black/80 mb-2">Materiał</label>

          <button
            type="button"
            onClick={() => setMaterialOpen(true)}
            className="w-full rounded-xl bg-white border border-black/10 px-4 py-3 text-left hover:border-black/20 transition flex items-center justify-between gap-3"
          >
            <span className="text-black/90">
              {selectedMaterial?.name || "Wybierz materiał"}
            </span>
            <span className="text-[#c9b086] text-sm font-semibold">Zmień</span>
          </button>

          {selectedMaterial ? (
            <div className="mt-3">
              {selectedMaterial.subtitle ? (
                <div className="text-sm text-black/70 leading-snug">
                  {selectedMaterial.subtitle}
                </div>
              ) : null}

              {selectedMaterial.desc ? (
                <p className="mt-2 text-sm text-black/70 leading-relaxed">
                  {selectedMaterial.desc.length > 180
                    ? selectedMaterial.desc.slice(0, 180) + "…"
                    : selectedMaterial.desc}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* EFEKTY + ADDONS */}
        <div className="mt-5 w-full">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "max-content max-content max-content",
              justifyContent: "space-between",
              alignItems: "start",
              width: "100%",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <label className="block text-sm text-black/80 mb-2">Efekty</label>
              <select
                value={effect}
                onChange={(e) => setEffect(e.target.value as EffectId)}
                className="rounded-md bg-white border border-black/10 px-3 py-2 outline-none focus:border-[#c9b086] text-black"
                style={{ width: 180 }}
              >
                <option value="none">Brak</option>
                <option value="sepia">Sepia</option>
                <option value="bw">Czarno - Białe</option>
              </select>
            </div>

            <div style={{ minWidth: 0 }}>
              <label className="block text-sm text-black/80 mb-2">
                Druk Premium
              </label>
              <div className="flex items-center gap-2 text-sm text-black/70 select-none">
                <input
                  type="checkbox"
                  checked={drukPremium}
                  onChange={(e) => setDrukPremium(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 bg-white accent-[#c9b086]"
                />
                <span className="whitespace-nowrap">10zł / m2</span>
                <span className="translate-y-px">
                  <InfoIcon />
                </span>
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <label className="block text-sm text-black/80 mb-2">
                Klej do tapet
              </label>
              <div className="flex items-center gap-2 text-sm text-black/70 select-none">
                <input
                  type="checkbox"
                  checked={klejDoTapet}
                  onChange={(e) => setKlejDoTapet(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 bg-white accent-[#c9b086]"
                />
                <span className="whitespace-nowrap">39.00 zł</span>
                <span className="translate-y-px">
                  <InfoIcon />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SHORT DESCRIPTION */}
        {shortDescriptionHtml ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
            <div
              className="prose max-w-none prose-p:leading-relaxed prose-a:text-[#c9b086] prose-strong:text-black prose-p:text-black/80"
              dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
            />
          </div>
        ) : null}

        {/* PRECIO */}
        <div className="mt-6">
          {cleanPriceHtml ? (
            <div
              className="text-lg md:text-xl font-semibold text-black"
              dangerouslySetInnerHTML={{ __html: cleanPriceHtml }}
            />
          ) : (
            <p className="text-lg md:text-xl font-semibold text-black">
              {fallbackPrice || ""}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="rounded-2xl bg-black text-white font-semibold px-5 py-3 hover:bg-black/90 transition"
          >
            Dodaj do koszyka
          </button>

          <div className="relative">
            <UlubioneHeartButton
              id={wishlistId}
              slug={typeof productSlug === "string" ? productSlug : undefined}
              name={productName}
              image={mainImageForWishlist || undefined}
              priceHtml={cleanPriceHtml || priceHtml || ""}
              className="h-full"
              // @ts-expect-error ref passthrough (si tu componente no forwardRef, esto se ignora)
              ref={heartBtnRef}
            />
          </div>
        </div>

        {(String(sku || "").trim() || categoriesText) ? (
          <div className="mt-4 text-sm text-black/80 space-y-1">
            {String(sku || "").trim() ? (
              <div>
                <span className="font-semibold text-black">SKU:</span>{" "}
                {String(sku || "").trim()}
              </div>
            ) : null}

            {categoriesText ? (
              <div>
                <span className="font-semibold text-black">Kategorie:</span>{" "}
                <span className="text-black/70">{categoriesText}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <ProductTrustBar avgText={avgPrice30DaysText} />

        <div className="mt-3 text-xs text-black/60">
          Możesz uzyskać naszą próbkę fototapety pod tym linkiem:{" "}
          <Link
            href={sampleHref}
            className="text-[#c9b086] hover:underline font-semibold"
          >
            Próbka Fototapety 29.00zł
          </Link>
        </div>
      </section>

      {/* ✅ TABS FULL WIDTH */}
      <section className="md:col-span-2 mt-6 border-t border-black/10 pt-6">
        <div className="flex items-center gap-6 text-sm">
          <button
            type="button"
            onClick={() => setTab("opis")}
            className={[
              "pb-3 border-b-2 transition",
              tab === "opis"
                ? "border-[#c9b086] text-black"
                : "border-transparent text-black/70 hover:text-black",
            ].join(" ")}
          >
            Opis
          </button>

          <button
            type="button"
            onClick={() => setTab("info")}
            className={[
              "pb-3 border-b-2 transition",
              tab === "info"
                ? "border-[#c9b086] text-black"
                : "border-transparent text-black/70 hover:text-black",
            ].join(" ")}
          >
            Informacje dodatkowe
          </button>
        </div>

        <div className="mt-6">
          {tab === "opis" ? (
            <div
              className="prose max-w-none prose-p:leading-relaxed prose-a:text-[#c9b086] prose-strong:text-black prose-p:text-black/80"
              dangerouslySetInnerHTML={{ __html: descriptionHtml || "" }}
            />
          ) : (
            <div className="w-full">
              {additionalRows.length ? (
                <div className="w-full rounded-xl border border-black/10 overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      {additionalRows.map((row, idx) => (
                        <tr
                          key={`${row.label}-${idx}`}
                          className="border-t border-black/10 first:border-t-0"
                        >
                          <td className="w-48 align-top bg-black/5 px-4 py-4 text-black font-semibold">
                            {row.label}
                          </td>
                          <td className="px-4 py-4 text-black/70">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-black/60 text-sm">
                  Brak danych dodatkowych.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* POPUP MATERIAL — SIEMPRE 2 COLUMNAS (lista izquierda / imagen+desc derecha) */}
      {materialOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setMaterialOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden"
            style={{ maxHeight: "86vh" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-black/10">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-black leading-tight">
                  Wybierz materiał
                </h3>
                <p className="mt-1 text-sm text-black/60">
                  Kliknij materiał, aby wybrać i zobaczyć opis.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMaterialOpen(false)}
                className="shrink-0 rounded-xl px-4 py-2 bg-white border border-black/10 text-black/80 hover:bg-black/5 transition shadow"
              >
                Zamknij
              </button>
            </div>

            <div
              className="p-5"
              style={{
                maxHeight: "calc(86vh - 70px)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "320px 1fr",
                  gap: 20,
                  height: "100%",
                }}
              >
                {/* Left: list (scroll propio) */}
                <div
                  className="space-y-3"
                  style={{
                    minWidth: 0,
                    maxHeight: "calc(86vh - 110px)",
                    overflow: "auto",
                    paddingRight: 6,
                  }}
                >
                  <div className="space-y-3">
                    {MATERIALS.map((m) => {
                      const isActiveMat = m.id === selectedMaterialId;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMaterialId(m.id)}
                          className={[
                            "w-full text-left rounded-2xl px-4 py-3 transition border shadow-sm",
                            isActiveMat
                              ? "border-[#c9b086] bg-black/5"
                              : "border-black/10 bg-white hover:bg-black/5 hover:border-black/20",
                          ].join(" ")}
                        >
                          <div className="text-sm font-semibold text-black leading-snug">
                            {m.name}
                          </div>

                          {m.subtitle ? (
                            <div className="mt-1 text-xs text-black/55 leading-snug">
                              {m.subtitle}
                            </div>
                          ) : (
                            <div className="mt-1 text-xs text-black/50">
                              Kliknij, aby zobaczyć opis
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: preview (scroll vertical) */}
                <div className="min-w-0">
                  <div
                    className="rounded-2xl border border-black/10 bg-white p-4"
                    style={{
                      maxHeight: "calc(86vh - 110px)",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    <div className="relative rounded-xl border border-black/10 bg-black/5 overflow-hidden">
                      <div
                        style={{
                          aspectRatio: "16 / 9",
                          maxHeight: 260,
                          height: "auto",
                        }}
                      >
                        {selectedMaterial?.image ? (
                          <img
                            src={selectedMaterial.image}
                            alt={selectedMaterial.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-black/50 text-sm">
                            Brak zdjęcia
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full bg-white/70 border border-black/10 text-black/80 hover:bg-white transition grid place-items-center"
                          aria-label="Powiększ podgląd"
                          title="Powiększ"
                          onClick={() => {}}
                        >
                          <IconSearchPlus />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-lg font-semibold text-black leading-tight">
                        {selectedMaterial?.name}
                      </div>

                      {selectedMaterial?.subtitle ? (
                        <div className="mt-1 text-sm text-black/60">
                          {selectedMaterial.subtitle}
                        </div>
                      ) : null}

                      <div className="mt-2 text-sm text-black/60">
                        Pasowanie brytów:{" "}
                        <span className="text-black/70">
                          {selectedMaterial?.features?.find((f) =>
                            /Pasowanie brytów/i.test(f)
                          ) || "—"}
                        </span>{" "}
                        • Maks. szerokość brytu:{" "}
                        <span className="text-black/70">100 cm</span>
                      </div>

                      <div className="mt-3 text-sm text-black/75 leading-relaxed whitespace-pre-line">
                        {selectedMaterial?.desc || "Brak opisu."}
                      </div>

                      {Array.isArray(selectedMaterial?.features) &&
                      selectedMaterial.features.length ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-black/85">
                            Cechy materiału:
                          </div>
                          <ul className="mt-2 space-y-1 text-sm text-black/70 list-disc pl-5">
                            {selectedMaterial.features.map((f, idx) => (
                              <li key={`${selectedMaterial.id}-f-${idx}`}>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setMaterialOpen(false)}
                        className="rounded-2xl px-6 py-3 bg-white border border-black/10 text-black/80 hover:bg-black/5 transition"
                      >
                        Anuluj
                      </button>

                      <button
                        type="button"
                        onClick={() => setMaterialOpen(false)}
                        className="rounded-2xl px-6 py-3 bg-[#c9b086] text-black font-semibold hover:opacity-90 transition shadow"
                      >
                        Wybierz
                      </button>
                    </div>
                  </div>
                </div>
                {/* /Right */}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
