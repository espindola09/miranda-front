import { getProducts } from "@/lib/woo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let products: any[] = [];

  try {
    const data = await getProducts(6);
    products = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[Home] getProducts failed:", err);
    products = [];
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Miranda Morris — Next Headless
      </h1>

      {products.length === 0 ? (
        <div className="border rounded p-4 text-sm text-gray-700">
          No se pudieron cargar productos (posible 401 / credenciales / bloqueo). Revisá logs de Vercel.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p: any) => {
            const imgSrc = p?.images?.[0]?.src || "";
            const price = p?.price ?? "";
            const name = p?.name ?? "Sin nombre";
            const slug = p?.slug ?? "";
            const id = p?.id ?? `${slug}-${name}`;

            return (
              <li key={id} className="border p-4 rounded">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={name}
                    className="w-full h-48 object-cover mb-3"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 mb-3 flex items-center justify-center text-xs text-gray-500">
                    Sin imagen
                  </div>
                )}

                <a
                  href={slug ? `/produkt/${slug}` : "#"}
                  className="font-semibold hover:underline"
                >
                  {name}
                </a>

                <p className="text-sm text-gray-600">
                  {price !== "" ? `${price} zł` : "Precio no disponible"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
