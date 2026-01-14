"use client";

import React from "react";
import Link from "next/link";

type WooImg = { src?: string; alt?: string };
type WooProduct = {
  id: number;
  name: string;
  slug: string;
  price?: string;
  price_html?: string;
  images?: WooImg[];
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pickPrice(p: WooProduct) {
  // Si querés renderizar HTML de Woo, mantené price_html.
  // Para grilla simple: usamos "price" si existe.
  if (p.price) return `${p.price} zł`;

  const ph = String(p.price_html || "");
  if (!ph) return "";
  return stripHtml(ph);
}

export default function RelatedProductsClient({
  products,
}: {
  products: WooProduct[];
}) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="mt-12 border-t border-white/10 pt-10">
        <h2 className="text-2xl font-bold text-white/90">Polecane produkty</h2>
        <p className="mt-3 text-sm text-white/60">
          Brak produktów powiązanych do wyświetlenia.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12 border-t border-white/10 pt-10">
      <h2 className="text-2xl font-bold text-white/90">Polecane produkty</h2>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => {
          const img = p.images?.[0]?.src || "";
          const priceText = pickPrice(p);

          return (
            <Link
              key={p.id}
              href={`/produkt/${p.slug}`}
              className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition"
              title={p.name}
            >
              <div className="aspect-square bg-black/40 overflow-hidden">
                {img ? (
                  <img
                    src={img}
                    alt={p.images?.[0]?.alt || p.name}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-white/40 text-sm">
                    No image
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="text-sm font-semibold text-white/90 leading-snug line-clamp-2">
                  {p.name}
                </div>

                {priceText ? (
                  <div className="mt-2 text-sm text-white/80">{priceText}</div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
