"use client";

import React, { useMemo, useState } from "react";

/* ✅ ULUBIONE — REMOVIDO en Próbka (no lo vamos a usar) */
// import UlubioneHeartButton from "@/components/ulubione/UlubioneHeartButton";

type Img = { id?: number; src: string; alt?: string };

type Props = {
  // ✅ Se mantienen por compatibilidad (no rompen si page.tsx los sigue pasando)
  productId?: number;
  productSlug?: string;

  productName: string;
  images: Img[];
  priceHtml?: string;
  fallbackPrice?: string;

  // SKU del producto “real” que te pasó el link
  refSku?: string | null;

  // (opcional) html desc del producto de prueba
  shortDescriptionHtml?: string;
  descriptionHtml?: string;

  // ✅ Meta opcional (para que coincida con lo que pasás desde page.tsx)
  sku?: string | null;
  stockStatus?: string | null;

  // ✅ Para mostrar TODAS las categorías del producto actual (Próbka)
  categoryNames?: string[] | null;
};

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

function normalizeString(v: unknown): string {
  return String(v ?? "").trim();
}

function joinCategories(categoryNames?: string[] | null) {
  if (!Array.isArray(categoryNames) || categoryNames.length === 0) return "";
  const cleaned = categoryNames.map((s) => normalizeString(s)).filter(Boolean);
  if (cleaned.length === 0) return "";
  return Array.from(new Set(cleaned)).join(", ");
}

export default function FototapetySampleClient({
  productId, // se mantiene por compatibilidad
  productSlug, // se mantiene por compatibilidad
  productName,
  images,
  priceHtml,
  fallbackPrice,
  refSku,
  shortDescriptionHtml,
  descriptionHtml,
  sku,
  stockStatus,
  categoryNames,
}: Props) {
  // Imagen activa (por ahora fija a la primera como en tu versión)
  const active = images?.[0]?.src || "";

  // Material (por ahora simple; si querés tu popup lo conectamos después)
  const [material, setMaterial] = useState("Flizelinowa Gładka 170g");

  // Ejemplo de selects de tamaño (como screenshot)
  const [w, setW] = useState("50cm");
  const [h, setH] = useState("50cm");

  // Campo “Numer Produktu” prellenado con refSku
  const [productNumber, setProductNumber] = useState(refSku || "");

  // Precio limpio
  const cleanPriceHtml = useMemo(
    () => buildCleanPriceHtml(priceHtml),
    [priceHtml]
  );

  // ✅ Categorías completas (como en el sitio actual)
  const categoriesText = useMemo(
    () => joinCategories(categoryNames),
    [categoryNames]
  );

  const skuText = useMemo(() => normalizeString(sku), [sku]);

  // Nota: lo dejo calculado aunque no lo muestres ahora (por si luego querés “Stan”)
  const stockLabel = useMemo(() => {
    const s = normalizeString(stockStatus);
    if (!s) return "";
    return s === "instock" ? "Dostępny" : s;
  }, [stockStatus]);

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {/* IZQ */}
      <section className="self-start">
        <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-lg">
          {active ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active}
              alt={productName}
              className="w-full h-auto block object-cover"
              loading="eager"
            />
          ) : (
            <div className="p-14 text-black/50">No image</div>
          )}
        </div>
      </section>

      {/* DER */}
      <section className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight text-black">
          {productName}
        </h1>

        {/* ✅ Chips SOLO como en tu screenshot (SKU + Kategoria), sin Stan */}
        {(skuText || categoriesText) ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {skuText ? (
              <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-black/70">
                SKU: {skuText}
              </span>
            ) : null}

            {categoriesText ? (
              <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-black/70">
                Kategoria: {categoriesText}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Precio limpio */}
        <div className="mt-4">
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

        {/* Material */}
        <div className="mt-6">
          <label className="block text-sm text-black/80 mb-2">Materiał</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full rounded-md bg-white border border-black/15 px-3 py-2 outline-none focus:border-[#c9b086] text-black"
          >
            <option value="Flizelinowa Gładka 170g">
              Flizelinowa Gładka 170g
            </option>
            <option value="Flizelinowa Gładka PREMIUM 220g">
              Flizelinowa Gładka PREMIUM 220g
            </option>
          </select>
        </div>

        {/* Szerokość / Wysokość */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-black/80 mb-2">
              Szerokość (cm):
            </label>
            <select
              value={w}
              onChange={(e) => setW(e.target.value)}
              className="w-full rounded-md bg-white border border-black/15 px-3 py-2 outline-none focus:border-[#c9b086] text-black"
            >
              <option value="50cm">50cm</option>
              <option value="70cm">70cm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-black/80 mb-2">
              Wysokość (cm):
            </label>
            <select
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="w-full rounded-md bg-white border border-black/15 px-3 py-2 outline-none focus:border-[#c9b086] text-black"
            >
              <option value="50cm">50cm</option>
              <option value="100cm">100cm</option>
            </select>
          </div>
        </div>

        {/* SKU del producto original (refSku) — como en el sitio actual */}
        {normalizeString(refSku) ? (
          <div className="mt-4 text-sm text-black/80">
            <span className="font-semibold text-black">SKU:</span>{" "}
            {normalizeString(refSku)}
          </div>
        ) : null}

        {/* Numer Produktu */}
        <div className="mt-6">
          <label className="block text-sm text-black/80 mb-2">
            Numer Produktu: <span className="text-red-500">*</span>
          </label>
          <input
            value={productNumber}
            onChange={(e) => setProductNumber(e.target.value)}
            className="w-full rounded-md bg-white border border-black/15 px-3 py-3 outline-none focus:border-[#c9b086] text-black placeholder:text-black/40"
            placeholder="Wpisz numer produktu"
          />
          <div className="mt-2 text-xs text-black/60">
            Wpisz numer produktu, dla którego chcesz zamówić próbkę.
          </div>
        </div>

        {/* CTA (SIN ULUBIONE en Próbka) */}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl bg-black text-white font-semibold px-6 py-3 hover:bg-black/90 transition"
          >
            Dodaj do koszyka
          </button>
        </div>

        {/* ✅ DESCRIPCIÓN CORTA: se queda donde estaba */}
        {shortDescriptionHtml ? (
          <div className="mt-8 rounded-2xl border border-black/10 bg-white p-5">
            <div
              className="prose max-w-none prose-p:text-black/80 prose-strong:text-black prose-a:text-[#c9b086]"
              dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
            />
          </div>
        ) : null}
      </section>

      {/* ✅ DESCRIPCIÓN LARGA: full width como el resto de productos */}
      {descriptionHtml ? (
        <section className="md:col-span-2 mt-6 border-t border-black/10 pt-6">
          <h2 className="text-lg font-semibold text-black mb-4">Opis</h2>
          <div
            className="prose max-w-none prose-p:text-black/80 prose-strong:text-black prose-a:text-[#c9b086]"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </section>
      ) : null}
    </div>
  );
}
