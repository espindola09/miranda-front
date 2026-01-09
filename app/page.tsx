import { getProducts } from "@/lib/woo";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function Home() {
  const products = await getProducts(6);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Miranda Morris — Next Headless
      </h1>

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p: any) => (
          <li key={p.id} className="border p-4 rounded">
            <img
              src={p.images?.[0]?.src}
              alt={p.name}
              className="w-full h-48 object-cover mb-3"
            />
            <a href={`/produkt/${p.slug}`} className="font-semibold hover:underline">
            {p.name}
            </a>
            <p className="text-sm text-gray-600">{p.price} zł</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
