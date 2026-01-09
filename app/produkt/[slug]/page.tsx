import { getProductBySlug } from "@/lib/woo";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const imageUrl = product.images?.[0]?.src || "";

  // Precio: preferimos price_html si existe (mejor formato), sino fallback
  const priceHtml = (product as any)?.price_html as string | undefined;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Breadcrumb minimal (placeholder para luego) */}
        <div className="mb-6 text-sm text-white/60">
          <span className="hover:text-white/80 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-white/80">Product</span>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* GALERÍA / IMAGEN */}
          <section className="self-start">
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-lg">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-auto block object-cover"
                  loading="eager"
                />
              ) : (
                <div className="p-14 text-white/50">No image</div>
              )}
            </div>

            {/* Thumbs placeholder (si luego querés galería real) */}
            {product.images?.length > 1 ? (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {product.images.slice(0, 5).map((img: any, idx: number) => (
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

          {/* INFO */}
          <section className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="mt-3">
              {priceHtml ? (
                <div
                  className="text-xl md:text-2xl font-semibold text-white/90"
                  dangerouslySetInnerHTML={{ __html: priceHtml }}
                />
              ) : (
                <p className="text-xl md:text-2xl font-semibold text-white/90">
                  {product.price} zł
                </p>
              )}
            </div>

            {/* Meta rápida */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {product.sku ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                  SKU: {product.sku}
                </span>
              ) : null}
              {product.stock_status ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                  Stock: {product.stock_status}
                </span>
              ) : null}
              {product.categories?.[0]?.name ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                  Category: {product.categories[0].name}
                </span>
              ) : null}
            </div>

            {/* Descripción corta */}
            {product.short_description ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div
                  className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              </div>
            ) : null}

            {/* CTA placeholder (luego se conecta con Add to Cart headless) */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-2xl bg-white text-black font-semibold px-5 py-3 hover:bg-white/90 transition"
              >
                Add to cart (next step)
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/15 bg-white/5 text-white font-semibold px-5 py-3 hover:bg-white/10 transition"
              >
                Add to wishlist (later)
              </button>
            </div>

            {/* Descripción larga */}
            {product.description ? (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-white/90 mb-3">
                  Description
                </h2>
                <div
                  className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-white/90 prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
