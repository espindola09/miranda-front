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

  const isFototapety = isFototapetyProduct(product);

  // Máximos desde dimensiones (solo Fototapety los tiene cargados)
  const maxWidthCm = Number((product as any)?.dimensions?.width || 0);
  const maxHeightCm = Number((product as any)?.dimensions?.height || 0);

  // Imágenes
  const images = Array.isArray(product.images) ? product.images : [];

  // Precio numérico (✅ confiable)
  const onSale = Boolean((product as any)?.on_sale);
  const regularPrice = String((product as any)?.regular_price || "");
  const salePrice = String((product as any)?.sale_price || "");
  const currentPrice = String((product as any)?.price || "");
  const currency = "zł"; // si luego lo querés dinámico, lo hacemos con settings endpoint

  // Meta
  const sku = (product as any)?.sku ?? null;
  const stockStatus = (product as any)?.stock_status ?? null;
  const categoryName =
    (product as any)?.categories?.[0]?.name ? String((product as any).categories[0].name) : null;

  // Descripciones
  const shortDescriptionHtml = (product as any)?.short_description as string | undefined;
  const descriptionHtml = (product as any)?.description as string | undefined;

  if (!isFototapety) {
    // Por ahora solo Fototapety (luego sumamos las otras 4 familias)
    // Si querés, acá ponemos un fallback layout.
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Breadcrumb minimal (placeholder para luego) */}
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
            shortDescriptionHtml={shortDescriptionHtml}
            descriptionHtml={descriptionHtml}
            sku={sku}
            stockStatus={stockStatus}
            categoryName={categoryName}
            onSale={onSale}
            regularPrice={regularPrice}
            salePrice={salePrice}
            currentPrice={currentPrice}
            currency={currency}
          />
        ) : (
          <div className="text-white/70">
            Este producto no es Fototapety (luego armamos el layout para su familia).
          </div>
        )}
      </div>
    </main>
  );
}
