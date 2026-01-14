import { getProductBySlug } from "@/lib/woo";
import { notFound } from "next/navigation";
import FototapetyProductClient, { type AdditionalInfoRow } from "./FototapetyProductClient";
import FototapetySampleClient from "./FototapetySampleClient";
import Link from "next/link";

function isFototapetyProduct(product: any) {
  const cats = Array.isArray(product?.categories) ? product.categories : [];
  return cats.some((c: any) => {
    const slug = String(c?.slug || "").toLowerCase();
    const name = String(c?.name || "").toLowerCase();
    return slug === "fototapety" || name === "fototapety";
  });
}

function pickFirstString(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return String(v[0] ?? "");
  return "";
}

function uniqueCategoryNames(product: any): string[] {
  const cats = Array.isArray(product?.categories) ? product.categories : [];
  const names = cats
    .map((c: any) => String(c?.name || "").trim())
    .filter(Boolean);

  return Array.from(new Set(names));
}

// ✅ Leyendas fijas pedidas (incrustadas en el código)
const FIXED_MATERIALS_TEXT =
  "dostępne materiały: Flizelinowa Gładka 170g, Flizelinowa Gładka PREMIUM 220g, Winyl na flizelinie beton, Winylowa na flizelinie strukturalna 360g, Samoprzylepna, Winylowa na flizelinie strukturalna BRUSH 360g";

const FIXED_PANELS_NOTE_TEXT =
  "Ilość brytów jest orientacyjna. Jeśli potrzebujesz konkretnej szerokości, podaj to w uwagach. Inaczej fototapeta może być podzielona inaczej.\nPamiętaj! Jest to produkt indywidualny i warto dodać do potrzebnego wymiaru 3cm zapasu.";

/**
 * Construye filas para "Informacje dodatkowe" de forma robusta.
 * - Prioridad: product.attributes (aunque visible venga false).
 * - Fallback: dimensiones (si existen).
 * - ✅ Inserta leyendas fijas debajo de “Wymiary maksymalne”.
 *
 * IMPORTANTE: Esta tabla solo la mostramos en Fototapety.
 */
function buildAdditionalInfoRows(product: any): AdditionalInfoRow[] {
  const rows: AdditionalInfoRow[] = [];

  // 1) Atributos Woo
  const attrs = Array.isArray(product?.attributes) ? product.attributes : [];
  for (const a of attrs) {
    const label = String(a?.name || "").trim();
    const options = Array.isArray(a?.options) ? a.options : [];
    const value = options
      .map((x: any) => String(x || "").trim())
      .filter(Boolean)
      .join(", ");

    if (label && value) rows.push({ label, value });
  }

  // 2) Dimensiones
  const dimW = String(product?.dimensions?.width || "").trim();
  const dimH = String(product?.dimensions?.height || "").trim();

  if (dimW && dimH) {
    const alreadyHasDims = rows.some((r) => {
      const l = String(r.label || "").toLowerCase();
      return l.includes("wymiar") || l.includes("dimension");
    });

    if (!alreadyHasDims) {
      rows.unshift({
        label: "Wymiary maksymalne",
        value: `${dimW} × ${dimH} cm`,
      });
    }
  }

  // 3) Leyendas fijas debajo de “Wymiary maksymalne”
  const hasMaterialRow = rows.some((r) => String(r.label || "").toLowerCase().includes("mater"));

  const hasPanelsNote = rows.some((r) => {
    const v = String(r.value || "").toLowerCase();
    const l = String(r.label || "").toLowerCase();
    return v.includes("ilość bryt") || v.includes("pamiętaj") || l.includes("ilość") || l.includes("bryt");
  });

  const dimsIndex = rows.findIndex(
    (r) => String(r.label || "").toLowerCase() === "wymiary maksymalne"
  );
  const insertAt = dimsIndex >= 0 ? dimsIndex + 1 : 0;

  if (!hasMaterialRow) {
    rows.splice(insertAt, 0, { label: "Materiał", value: FIXED_MATERIALS_TEXT });
  }

  if (!hasPanelsNote) {
    rows.splice(insertAt + 1, 0, { label: "", value: FIXED_PANELS_NOTE_TEXT });
  }

  // 4) Deduplicación por label (nota con label vacío se conserva)
  const seen = new Set<string>();
  const unique: AdditionalInfoRow[] = [];
  for (const r of rows) {
    const k = String(r.label || "").toLowerCase();
    if (k && seen.has(k)) continue;
    if (k) seen.add(k);
    unique.push(r);
  }

  return unique;
}

/**
 * ✅ Related products (server-side)
 * - Primero intenta product.related_ids (Woo).
 * - Si no hay, fallback por categoría.
 * - Usa WC REST v3 con Basic Auth vía env vars.
 */
async function fetchRelatedProducts(product: any) {
  try {
    const baseRaw =
      process.env.WP_BASE_URL ||
      process.env.NEXT_PUBLIC_WP_BASE_URL ||
      process.env.NEXT_PUBLIC_WORDPRESS_URL;

    const ck =
      process.env.WC_CONSUMER_KEY ||
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;

    const cs =
      process.env.WC_CONSUMER_SECRET ||
      process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

    if (!baseRaw || !ck || !cs) return [];

    const base = String(baseRaw).replace(/\/+$/, ""); // sin slash final
    const auth =
      typeof Buffer !== "undefined"
        ? Buffer.from(`${ck}:${cs}`).toString("base64")
        : "";

    const currentId = Number(product?.id || 0);

    const relatedIdsRaw = Array.isArray(product?.related_ids)
      ? product.related_ids
      : [];

    const relatedIds = relatedIdsRaw
      .map((x: any) => Number(x))
      .filter((n: number) => Number.isFinite(n) && n > 0 && n !== currentId)
      .slice(0, 8);

    // 1) related_ids
    if (relatedIds.length > 0) {
      const url =
        `${base}/wp-json/wc/v3/products?` +
        `include=${encodeURIComponent(relatedIds.join(","))}&` +
        `status=publish&per_page=${encodeURIComponent(String(relatedIds.length))}`;

      const res = await fetch(url, {
        headers: auth ? { Authorization: `Basic ${auth}` } : undefined,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) return data;
      }
    }

    // 2) fallback por categoría (primera categoría)
    const catId = Number(product?.categories?.[0]?.id || 0);
    if (catId > 0) {
      const url =
        `${base}/wp-json/wc/v3/products?` +
        `category=${encodeURIComponent(String(catId))}&` +
        `status=publish&per_page=8&orderby=date&order=desc&` +
        `exclude=${encodeURIComponent(String(currentId || ""))}`;

      const res = await fetch(url, {
        headers: auth ? { Authorization: `Basic ${auth}` } : undefined,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) return data;
      }
    }

    return [];
  } catch {
    return [];
  }
}

function RelatedProductsSection({ products }: { products: any[] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-white/10 pt-8">
      <h2 className="text-lg md:text-xl font-semibold text-white/90 mb-5">
        Produkty powiązane
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p: any) => {
          const img = Array.isArray(p?.images) ? p.images?.[0]?.src : "";
          const name = String(p?.name || "");
          const slug = String(p?.slug || "");
          const priceHtml = String(p?.price_html || "");
          const fallback = p?.price ? `${p.price} zł` : "";

          return (
            <Link
              key={p?.id ?? slug}
              href={`/produkt/${encodeURIComponent(slug)}`}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
            >
              <div className="bg-black/40" style={{ aspectRatio: "4 / 3" }}>
                {img ? (
                  <img
                    src={img}
                    alt={name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>

              <div className="p-3">
                <div className="text-sm font-semibold text-white/90 line-clamp-2">
                  {name}
                </div>

                <div className="mt-2 text-sm text-white/80">
                  {priceHtml ? (
                    <span dangerouslySetInnerHTML={{ __html: priceHtml }} />
                  ) : (
                    <span>{fallback}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (searchParams ? await searchParams : undefined) || {};

  // Para la página de "Próbka": recibimos el SKU del producto origen por querystring
  const refSku = pickFirstString(sp.ref_sku);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Imágenes (robusto)
  const images = Array.isArray(product?.images) ? product.images : [];
  const mainImageUrl = images?.[0]?.src || "";

  // Precio HTML (Woo) + fallback
  const priceHtml = (product as any)?.price_html as string | undefined;
  const fallbackPrice = product?.price ? `${product.price} zł` : "";

  // Meta
  const skuText = String(product?.sku || "");
  const categoryNames = uniqueCategoryNames(product);

  const isFototapety = isFototapetyProduct(product);

  // ✅ Informacje dodatkowe SOLO para Fototapety
  const additionalInfo: AdditionalInfoRow[] = isFototapety
    ? buildAdditionalInfoRows(product)
    : [];

  // ✅ Related products (server-side) — SIEMPRE (así no desaparecen)
  const relatedProducts = await fetchRelatedProducts(product);

  // ✅ Caso especial: producto de prueba
  if (slug === "probka-fototapety") {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          {/* Breadcrumb minimal */}
          <div className="mb-6 text-sm text-white/60">
            <span className="hover:text-white/80 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-white/80">Produkt</span>
          </div>

          <FototapetySampleClient
            productName={product.name}
            images={images}
            priceHtml={priceHtml}
            fallbackPrice={fallbackPrice}
            refSku={refSku}
            shortDescriptionHtml={product.short_description || ""}
            descriptionHtml={product.description || ""}
            sku={skuText}
            stockStatus={product.stock_status || ""}
            categoryNames={categoryNames}
          />

          {/* ✅ Productos relacionados */}
          <RelatedProductsSection products={relatedProducts} />
        </div>
      </main>
    );
  }

  // Máximos desde dimensiones (solo Fototapety los tiene cargados)
  const maxWidthCm = Number((product as any)?.dimensions?.width || 0);
  const maxHeightCm = Number((product as any)?.dimensions?.height || 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Breadcrumb minimal */}
        <div className="mb-6 text-sm text-white/60">
          <span className="hover:text-white/80 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-white/80">Produkt</span>
        </div>

        {isFototapety ? (
          <FototapetyProductClient
            productName={product.name}
            images={images}
            maxWidthCm={Number.isFinite(maxWidthCm) ? maxWidthCm : 0}
            maxHeightCm={Number.isFinite(maxHeightCm) ? maxHeightCm : 0}
            defaultWidthCm={70}
            defaultHeightCm={100}
            maxPanelWidthCm={100}
            priceHtml={priceHtml}
            fallbackPrice={fallbackPrice}
            shortDescriptionHtml={product.short_description || ""}
            descriptionHtml={product.description || ""}
            sku={skuText}
            stockStatus={product.stock_status || ""}
            categoryName={product.categories?.[0]?.name || ""}
            categoryNames={categoryNames}
            additionalInfo={additionalInfo}
          />
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* IZQUIERDA */}
            <section className="self-start">
              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-auto block object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="p-14 text-white/50">No image</div>
                )}
              </div>

              {/* Thumbs placeholder */}
              {images.length > 1 ? (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {images.slice(0, 5).map((img: any, idx: number) => (
                    <div
                      key={img.id ?? `${img.src}-${idx}`}
                      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                      title={img.alt || product.name}
                    >
                      <img
                        src={img.src}
                        alt={img.alt || product.name}
                        className="w-full h-16 block object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {/* DERECHA */}
            <section className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {product.name}
              </h1>

              <div className="mt-3">
                {priceHtml ? (
                  <div
                    className="text-xl md:text-2xl font-semibold text-white/90"
                    dangerouslySetInnerHTML={{ __html: priceHtml }}
                  />
                ) : (
                  <p className="text-xl md:text-2xl font-semibold text-white/90">
                    {fallbackPrice}
                  </p>
                )}
              </div>

              {product.short_description ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div
                    className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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

              {/* META debajo del CTA */}
              {(skuText || categoryNames.length > 0) ? (
                <div className="mt-4 text-sm text-white/80 space-y-1">
                  {skuText ? (
                    <div>
                      <span className="font-semibold">SKU:</span> {skuText}
                    </div>
                  ) : null}

                  {categoryNames.length > 0 ? (
                    <div>
                      <span className="font-semibold">Kategorie:</span>{" "}
                      <span className="text-white/70">
                        {categoryNames.join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            {/* ✅ OPIS FULL WIDTH (igual comportamiento que en Fototapety) */}
            {product.description ? (
              <section className="md:col-span-2 mt-2 border-t border-white/10 pt-6">
                <div className="text-lg font-semibold text-white/90 mb-3">
                  Opis
                </div>
                <div
                  className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </section>
            ) : null}

            {/* ❌ Informacje dodatkowe NO se muestra aquí (solo Fototapety) */}
          </div>
        )}

        {/* ✅ Productos relacionados (no se pierde) */}
        <RelatedProductsSection products={relatedProducts} />
      </div>
    </main>
  );
}