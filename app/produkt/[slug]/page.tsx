export const runtime = "nodejs";

import { getProductBySlug } from "@/lib/woo";
import { notFound } from "next/navigation";
import FototapetyProductClient, {
  type AdditionalInfoRow,
} from "./FototapetyProductClient";
import FototapetySampleClient from "./FototapetySampleClient";
import Link from "next/link";

/* ✅ ULUBIONE (wishlist) — botón corazón (client) */
import UlubioneHeartButton from "@/components/ulubione/UlubioneHeartButton";

/* ----------------------------- helpers ----------------------------- */

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

/**
 * ✅ MISMO "limpiador" de precio que usás en FototapetyProductClient / SampleClient.
 */
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

const FIXED_MATERIALS_TEXT =
  "dostępne materiały: Flizelinowa Gładka 170g, Flizelinowa Gładka PREMIUM 220g, Winyl na flizelinie beton, Winylowa na flizelinie strukturalna 360g, Samoprzylepna, Winylowa na flizelinie strukturalna BRUSH 360g";

const FIXED_PANELS_NOTE_TEXT =
  "Ilość brytów jest orientacyjna. Jeśli potrzebujesz konkretnej szerokości, podaj to w uwagach. Inaczej fototapeta może być podzielona inaczej.\nPamiętaj! Jest to produkt indywidualny i warto dodać do potrzebnego wymiaru 3cm zapasu.";

function buildAdditionalInfoRows(product: any): AdditionalInfoRow[] {
  const rows: AdditionalInfoRow[] = [];

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

  const hasMaterialRow = rows.some((r) =>
    String(r.label || "").toLowerCase().includes("mater")
  );

  const hasPanelsNote = rows.some((r) => {
    const v = String(r.value || "").toLowerCase();
    const l = String(r.label || "").toLowerCase();
    return (
      v.includes("ilość bryt") ||
      v.includes("pamiętaj") ||
      l.includes("ilość") ||
      l.includes("bryt")
    );
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

function getAvgPrice30DaysText(product: any): string {
  const meta = Array.isArray(product?.meta_data) ? product.meta_data : [];
  if (!meta.length) return "";

  const preferredKeys = new Set<string>([
    "omnibus_avg_30_days",
    "omnibus_average_30_days",
    "omnibus_average_price_30_days",
    "omnibus_price_30_days",
    "avg_price_30_days",
    "average_price_30_days",
    "avg_30_days_price",
    "wc_omnibus_avg_30_days",
    "wc_omnibus_average_price_30_days",
    "_omnibus_avg_30_days",
    "_omnibus_average_price_30_days",
    "_omnibus_price_30_days",
  ]);

  for (const m of meta) {
    const k = String(m?.key || "").trim();
    if (!k) continue;
    if (preferredKeys.has(k)) {
      const v = m?.value;
      const s = typeof v === "string" ? v : v != null ? String(v) : "";
      return String(s || "").trim();
    }
  }

  for (const m of meta) {
    const k = String(m?.key || "").toLowerCase();
    if (!k) continue;
    if (k.includes("omnibus") && (k.includes("30") || k.includes("days"))) {
      const v = m?.value;
      const s = typeof v === "string" ? v : v != null ? String(v) : "";
      const out = String(s || "").trim();
      if (out) return out;
    }
  }

  return "";
}

function toBase64(input: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any)?.Buffer;
  if (B?.from) return B.from(input, "utf-8").toString("base64");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const btoaFn: any = (globalThis as any)?.btoa;
  if (typeof btoaFn === "function") {
    const bytes = new TextEncoder().encode(input);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoaFn(bin);
  }

  return "";
}

async function fetchRelatedProducts(product: any) {
  try {
    const baseRaw =
      process.env.WP_BASE_URL ||
      process.env.NEXT_PUBLIC_WP_BASE_URL ||
      process.env.NEXT_PUBLIC_WORDPRESS_URL;

    const ck =
      process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;

    const cs =
      process.env.WC_CONSUMER_SECRET ||
      process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

    if (!baseRaw || !ck || !cs) return [];

    const base = String(baseRaw).replace(/\/+$/, "");
    const auth = toBase64(`${ck}:${cs}`);
    if (!auth) return [];

    const currentId = Number(product?.id || 0);

    const relatedIdsRaw = Array.isArray(product?.related_ids)
      ? product.related_ids
      : [];

    const relatedIds = relatedIdsRaw
      .map((x: any) => Number(x))
      .filter((n: number) => Number.isFinite(n) && n > 0 && n !== currentId)
      .slice(0, 8);

    const commonHeaders = {
      Authorization: `Basic ${auth}`,
      "User-Agent": "Vercel-NextJS",
      Accept: "application/json",
    };

    if (relatedIds.length > 0) {
      const url =
        `${base}/wp-json/wc/v3/products?` +
        `include=${encodeURIComponent(relatedIds.join(","))}&` +
        `status=publish&per_page=${encodeURIComponent(
          String(relatedIds.length)
        )}`;

      const res = await fetch(url, {
        headers: commonHeaders,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) return data;
      }
    }

    const catId = Number(product?.categories?.[0]?.id || 0);
    if (catId > 0) {
      const url =
        `${base}/wp-json/wc/v3/products?` +
        `category=${encodeURIComponent(String(catId))}&` +
        `status=publish&per_page=8&orderby=date&order=desc&` +
        `exclude=${encodeURIComponent(String(currentId || ""))}`;

      const res = await fetch(url, {
        headers: commonHeaders,
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
    <section className="mt-12 border-t border-black/10 pt-8">
      <h2 className="text-lg md:text-xl font-semibold text-black mb-5">
        Polecane produkty
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p: any) => {
          const img = Array.isArray(p?.images) ? p.images?.[0]?.src : "";
          const name = String(p?.name || "");
          const slug = String(p?.slug || "");
          const priceHtml = String(p?.price_html || "");
          const clean = buildCleanPriceHtml(priceHtml);
          const fallback = p?.price ? `${p.price} zł` : "";

          return (
            <Link
              key={p?.id ?? slug}
              href={`/produkt/${encodeURIComponent(slug)}`}
              className="rounded-2xl border border-black/10 bg-white overflow-hidden hover:shadow-md transition"
            >
              <div className="bg-black/5" style={{ aspectRatio: "4 / 3" }}>
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
                <div className="text-sm font-semibold text-black line-clamp-2">
                  {name}
                </div>

                <div className="mt-2 text-sm text-black/80">
                  {clean ? (
                    <span dangerouslySetInnerHTML={{ __html: clean }} />
                  ) : priceHtml ? (
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

/* ----------------------------- page ----------------------------- */

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (searchParams ? await searchParams : undefined) || {};

  const refSku = pickFirstString(sp.ref_sku);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const images = Array.isArray(product?.images) ? product.images : [];
  const mainImageUrl = images?.[0]?.src || "";

  const priceHtml = (product as any)?.price_html as string | undefined;
  const cleanPriceHtml = buildCleanPriceHtml(priceHtml);
  const fallbackPrice = product?.price ? `${product.price} zł` : "";

  const skuText = String(product?.sku || "");
  const categoryNames = uniqueCategoryNames(product);

  const isFototapety = isFototapetyProduct(product);

  const additionalInfo: AdditionalInfoRow[] = isFototapety
    ? buildAdditionalInfoRows(product)
    : [];

  const avgPrice30DaysText = getAvgPrice30DaysText(product);

  const relatedProducts = await fetchRelatedProducts(product);

  const productId = Number(product?.id || 0);
  const productSlug = String(product?.slug || slug || "");
  const productName = String(product?.name || "");
  const productImg = Array.isArray(product?.images)
    ? String(product?.images?.[0]?.src || "")
    : "";
  const productPriceHtml =
    cleanPriceHtml || String((product as any)?.price_html || "");

  if (slug === "probka-fototapety") {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="mb-6 text-sm text-black/70">
            <span className="hover:text-[#c9b086] cursor-pointer">Home</span>
            <span className="mx-2 text-black/40">/</span>
            <span className="text-black/80">Produkt</span>
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

          <RelatedProductsSection products={relatedProducts} />
        </div>
      </main>
    );
  }

  const maxWidthCm = Number((product as any)?.dimensions?.width || 0);
  const maxHeightCm = Number((product as any)?.dimensions?.height || 0);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-6 text-sm text-black/70">
          <span className="hover:text-[#c9b086] cursor-pointer">Home</span>
          <span className="mx-2 text-black/40">/</span>
          <span className="text-black/80">Produkt</span>
        </div>

        {isFototapety ? (
          <FototapetyProductClient
            productId={productId}
            productSlug={productSlug}
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
            avgPrice30DaysText={avgPrice30DaysText}
          />
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <section className="self-start">
              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-lg">
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-auto block object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="p-14 text-black/60">No image</div>
                )}
              </div>

              {images.length > 1 ? (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {images.slice(0, 5).map((img: any, idx: number) => (
                    <div
                      key={img.id ?? `${img.src}-${idx}`}
                      className="rounded-xl border border-black/10 bg-white overflow-hidden"
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

            <section className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-black">
                {product.name}
              </h1>

              <div className="mt-3">
                {cleanPriceHtml ? (
                  <div
                    className="text-xl md:text-2xl font-semibold text-black"
                    dangerouslySetInnerHTML={{ __html: cleanPriceHtml }}
                  />
                ) : priceHtml ? (
                  <div
                    className="text-xl md:text-2xl font-semibold text-black"
                    dangerouslySetInnerHTML={{ __html: priceHtml }}
                  />
                ) : (
                  <p className="text-xl md:text-2xl font-semibold text-black">
                    {fallbackPrice}
                  </p>
                )}
              </div>

              {product.short_description ? (
                <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
                  <div
                    className="prose max-w-none prose-p:leading-relaxed prose-a:text-[#c9b086] prose-strong:text-black prose-p:text-black/80"
                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                  />
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row items-stretch">
                <button
                  type="button"
                  className="rounded-2xl bg-black text-white font-semibold px-5 py-3 hover:bg-black/90 transition"
                >
                  Dodaj do koszyka
                </button>

                <div className="relative">
                  <UlubioneHeartButton
                    id={productId}
                    slug={productSlug}
                    name={productName}
                    image={productImg}
                    priceHtml={productPriceHtml}
                    className="h-full"
                  />
                </div>
              </div>

              {skuText || categoryNames.length > 0 ? (
                <div className="mt-4 text-sm text-black/80 space-y-1">
                  {skuText ? (
                    <div>
                      <span className="font-semibold text-black">SKU:</span>{" "}
                      <span className="text-black/80">{skuText}</span>
                    </div>
                  ) : null}

                  {categoryNames.length > 0 ? (
                    <div>
                      <span className="font-semibold text-black">Kategorie:</span>{" "}
                      <span className="text-black/70">
                        {categoryNames.join(", ")}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            {product.description ? (
              <section className="md:col-span-2 mt-2 border-t border-black/10 pt-6">
                <div className="text-lg font-semibold text-black mb-3">
                  Opis
                </div>
                <div
                  className="prose max-w-none prose-p:leading-relaxed prose-a:text-[#c9b086] prose-strong:text-black prose-p:text-black/80"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </section>
            ) : null}
          </div>
        )}

        <RelatedProductsSection products={relatedProducts} />
      </div>
    </main>
  );
}
