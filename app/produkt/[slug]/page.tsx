import { getProductBySlug, getRelatedProductsForProduct } from "@/lib/woo";
import { notFound } from "next/navigation";
import FototapetyProductClient from "./FototapetyProductClient";
import FototapetySampleClient from "./FototapetySampleClient";
import RelatedProductsClient from "./RelatedProductsClient";

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

  // Imágenes
  const images = Array.isArray(product?.images) ? product.images : [];
  const mainImageUrl = images?.[0]?.src || "";

  // Precio
  const priceHtml = (product as any)?.price_html as string | undefined;
  const fallbackPrice = product?.price ? `${product.price} zł` : "";

  // Meta
  const skuText = String(product?.sku || "");
  const categoryNames = uniqueCategoryNames(product);

  // ✅ RELACIONADOS (SERVER SIDE, para evitar env MISSING)
  // - limit 4 (como tu captura)
  // - excluye el propio producto
  // - intenta varias categorías útiles
  let relatedProducts: any[] = [];
  try {
    relatedProducts = await getRelatedProductsForProduct(product, {
      limit: 4,
      excludeId: Number(product?.id || 0),
      perCategoryFetch: 16,
    });
  } catch (e) {
    // En prod/dev esto te ayuda a ver el error real en consola del server.
    console.error("[related-products] error:", e);
    relatedProducts = [];
  }

  // ✅ Caso especial: producto de prueba
  if (slug === "probka-fototapety") {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
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

          {/* ✅ Relacionados debajo (full width) */}
          <RelatedProductsClient products={relatedProducts} />
        </div>
      </main>
    );
  }

  const isFototapety = isFototapetyProduct(product);

  // Máximos desde dimensiones
  const maxWidthCm = Number((product as any)?.dimensions?.width || 0);
  const maxHeightCm = Number((product as any)?.dimensions?.height || 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
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
          />
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
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
                    dangerouslySetInnerHTML={{
                      __html: product.short_description,
                    }}
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

              {/* Mantengo tu meta debajo del CTA si lo usás aquí */}
              {/* ... */}

              {product.description ? (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-white/90 mb-3">
                    Opis
                  </h2>
                  <div
                    className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              ) : null}
            </section>
          </div>
        )}

        {/* ✅ Relacionados debajo (full width, como Woo) */}
        <RelatedProductsClient products={relatedProducts} />
      </div>
    </main>
  );
}
