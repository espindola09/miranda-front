import { getProductBySlug } from "@/lib/woo";
import { notFound } from "next/navigation";
import FototapetyProductClient from "./FototapetyProductClient";

function isFototapetyProduct(product: any) {
  const cats = Array.isArray(product?.categories) ? product.categories : [];
  return cats.some((c: any) => {
    const slug = String(c?.slug || "").toLowerCase();
    const name = String(c?.name || "").toLowerCase();
    return slug === "fototapety" || name === "fototapety";
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const priceHtml = (product as any)?.price_html as string | undefined;

  const isFototapety = isFototapetyProduct(product);

  // Máximos desde dimensiones (solo Fototapety los tiene cargados)
  const maxWidthCm = Number((product as any)?.dimensions?.width || 0);
  const maxHeightCm = Number((product as any)?.dimensions?.height || 0);

  // Imágenes
  const images = Array.isArray(product.images) ? product.images : [];
  const mainImageUrl = images?.[0]?.src || "";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Breadcrumb minimal (placeholder para luego) */}
        <div className="mb-6 text-sm text-white/60">
          <span className="hover:text-white/80 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-white/80">Produkt</span>
        </div>

        {/* ✅ Fototapety: renderiza layout especial (inputs a la derecha, precio arriba del CTA) */}
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
            fallbackPrice={product.price ? `${product.price} zł` : ""}
            shortDescriptionHtml={product.short_description || ""}
            descriptionHtml={product.description || ""}
            sku={product.sku || null}
            stockStatus={product.stock_status || null}
            categoryName={product.categories?.[0]?.name || null}
          />
        ) : (
          // Otros productos: layout estándar por ahora
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
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                {product.name}
              </h1>

              <div className="mt-4">
                {priceHtml ? (
                  <div
                    className="text-2xl md:text-3xl font-semibold text-white/90"
                    dangerouslySetInnerHTML={{ __html: priceHtml }}
                  />
                ) : (
                  <p className="text-2xl md:text-3xl font-semibold text-white/90">
                    {product.price} zł
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                {product.sku ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                    SKU: {product.sku}
                  </span>
                ) : null}
                {product.stock_status ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                    Stan:{" "}
                    {product.stock_status === "instock"
                      ? "Dostępny"
                      : product.stock_status}
                  </span>
                ) : null}
                {product.categories?.[0]?.name ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                    Kategoria: {product.categories[0].name}
                  </span>
                ) : null}
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
      </div>
    </main>
  );
}
