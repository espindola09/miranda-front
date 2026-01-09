import { getProducts } from "@/lib/woo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let products: any[] = [];
  let error = false;

  try {
    products = await getProducts(6);
  } catch (e) {
    console.error("Woo API error:", e);
    error = true;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Miranda Morris — Next Headless
      </h1>

      {error && (
        <div className="mb-6 rounded border border-red-500 bg-red-50 p-4 text-red-700">
          No se pudieron cargar productos (posible 401 / credenciales / bloqueo).
          Revisá permisos de la API WooCommerce.
        </div>
      )}

      {!error && products.length === 0 && (
        <p className="text-gray-500">No hay productos para mostrar.</p>
      )}

      {!error && products.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <li key={p.id} className="border p-4 rounded">
              {p.images?.[0]?.src && (
                <img
                  src={p.images[0].src}
                  alt={p.name}
                  className="w-full h-48 object-cover mb-3"
                />
              )}

              <a
                href={`/produkt/${p.slug}`}
                className="font-semibold hover:underline block"
              >
                {p.name}
              </a>

              {p.price && (
                <p className="text-sm text-gray-600">{p.price} zł</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
