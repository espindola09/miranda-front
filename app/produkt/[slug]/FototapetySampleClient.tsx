"use client";

import React, { useMemo, useState } from "react";

type Img = { id?: number; src: string; alt?: string };

type Props = {
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
  categoryName?: string | null;
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

export default function FototapetySampleClient({
  productName,
  images,
  priceHtml,
  fallbackPrice,
  refSku,
  shortDescriptionHtml,
  descriptionHtml,
  sku,
  stockStatus,
  categoryName,
}: Props) {
  const [activeIdx] = useState(0);
  const active = images?.[activeIdx]?.src || "";

  // Material (por ahora simple; si querés tu popup lo conectamos después)
  const [material, setMaterial] = useState("Flizelinowa Gładka 170g");

  // Ejemplo de selects de tamaño (como screenshot)
  const [w, setW] = useState("50cm");
  const [h, setH] = useState("50cm");

  // Campo “Numer Produktu” prellenado con refSku
  const [productNumber, setProductNumber] = useState(refSku || "");

  const cleanPriceHtml = useMemo(
    () => buildCleanPriceHtml(priceHtml),
    [priceHtml]
  );

  const stockLabel =
    stockStatus === "instock" ? "Dostępny" : stockStatus || "";

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      {/* IZQ */}
      <section className="self-start">
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
          {active ? (
            <img
              src={active}
              alt={productName}
              className="w-full h-auto block object-cover"
              loading="eager"
            />
          ) : (
            <div className="p-14 text-white/50">No image</div>
          )}
        </div>
      </section>

      {/* DER */}
      <section className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          {productName}
        </h1>

        {/* ✅ Meta chips opcionales */}
        {(sku || stockStatus || categoryName) ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
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
        ) : null}

        {/* Precio limpio */}
        <div className="mt-4">
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

        {/* Material */}
        <div className="mt-6">
          <label className="block text-sm text-white/80 mb-2">Materiał</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/20 text-white"
          >
            <option value="Flizelinowa Gładka 170g" className="bg-black">
              Flizelinowa Gładka 170g
            </option>
            <option value="Flizelinowa Gładka PREMIUM 220g" className="bg-black">
              Flizelinowa Gładka PREMIUM 220g
            </option>
          </select>
        </div>

        {/* Szerokość / Wysokość (como screenshot con selects) */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">
              Szerokość (cm):
            </label>
            <select
              value={w}
              onChange={(e) => setW(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/20 text-white"
            >
              <option className="bg-black" value="50cm">
                50cm
              </option>
              <option className="bg-black" value="70cm">
                70cm
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">
              Wysokość (cm):
            </label>
            <select
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-white/20 text-white"
            >
              <option className="bg-black" value="50cm">
                50cm
              </option>
              <option className="bg-black" value="100cm">
                100cm
              </option>
            </select>
          </div>
        </div>

        {/* SKU mostrado como en el sitio actual (refSku del producto original) */}
        {refSku ? (
          <div className="mt-4 text-sm text-white/80">
            <span className="font-semibold">SKU:</span> {refSku}
          </div>
        ) : null}

        {/* Numer Produktu (prellenado) */}
        <div className="mt-6">
          <label className="block text-sm text-white/80 mb-2">
            Numer Produktu: <span className="text-red-400">*</span>
          </label>
          <input
            value={productNumber}
            onChange={(e) => setProductNumber(e.target.value)}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-3 outline-none focus:border-white/20 text-white"
            placeholder="Wpisz numer produktu"
          />
          <div className="mt-2 text-xs text-white/60">
            Wpisz numer produktu, dla którego chcesz zamówić próbkę.
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl bg-white text-black font-semibold px-6 py-3 hover:bg-white/90 transition"
          >
            Dodaj do koszyka
          </button>
          <button
            type="button"
            className="h-12 w-12 rounded-2xl border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
            aria-label="Dodaj do ulubionych"
            title="Dodaj do ulubionych"
          >
            ♡
          </button>
        </div>

        {shortDescriptionHtml ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
            />
          </div>
        ) : null}

        {descriptionHtml ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white/90 mb-3">Opis</h2>
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
