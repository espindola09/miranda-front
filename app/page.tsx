// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import BestsellerySliderClient from "@/components/home/BestsellerySliderClient";

// Ajustá este import si tu helper existe con otro nombre/ruta.
// Si ya tenés getProducts en "@/lib/woo", mantenelo así.
import { getProducts } from "@/lib/woo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let products: any[] = [];
  let bestsellery: any[] = [];

  try {
    // Traemos más para poder filtrar “bestsellery” sin quedarnos cortos.
    // Si tu getProducts acepta límite, esto funciona. Si no, lo adaptamos.
    products = await getProducts(30);

    // Filtrado por categoría slug “bestsellery” (o nombre “Bestsellery”)
    bestsellery = (Array.isArray(products) ? products : []).filter((p: any) => {
      const cats = Array.isArray(p?.categories) ? p.categories : [];
      return cats.some((c: any) => {
        const slug = String(c?.slug || "").toLowerCase();
        const name = String(c?.name || "").toLowerCase();
        return slug === "bestsellery" || name === "bestsellery";
      });
    });

    // Fallback: si no hay categoría o aún no está consistente, mostramos primeros 8
    if (!bestsellery.length) {
      bestsellery = (Array.isArray(products) ? products : []).slice(0, 8);
    } else {
      bestsellery = bestsellery.slice(0, 12);
    }
  } catch (e) {
    // Si falla el fetch, simplemente no mostramos el slider
    bestsellery = [];
  }

  return (
    <main className="w-full bg-white">
      {/* HERO (estático por ahora; luego slider) */}
      <section className="w-full">
        <div className="w-full border-b border-[#c9b086]/60">
          <div className="grid w-full grid-cols-1 lg:grid-cols-[420px_1fr]">
            {/* PANEL IZQUIERDO */}
            <div className="bg-[#f3eee6] px-6 py-12 lg:px-14 lg:py-20">
              {/* ✅ En mobile/tablet centrado; en escritorio (lg+) vuelve a la izquierda */}
              <div className="mx-auto max-w-md text-center lg:mx-0 lg:text-left">
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
                  Twoja
                  <br />
                  Fototapeta
                </h1>

                <p className="mt-6 text-xl leading-relaxed text-black/70 sm:text-2xl">
                  największy wybór
                  <br />
                  bestsellerów
                </p>

                {/* CTA */}
                <div className="mt-8 flex justify-center lg:justify-start">
                  <Link
                    href="/sklep-fototapety"
                    className={[
                      "inline-flex items-center justify-center",
                      "bg-black px-10 py-3",
                      "text-sm font-semibold",
                      "!text-white",
                      "cursor-pointer",
                    ].join(" ")}
                  >
                    Sprawdź
                  </Link>
                </div>
              </div>
            </div>

            {/* PANEL DERECHO (imagen) */}
            <div className="relative w-full">
              <div className="relative h-90 w-full sm:h-105 lg:h-130 xl:h-140">
                <Image
                  src="https://drukdekoracje.pl/wp-content/uploads/2025/11/AdobeStock_6609484541HD-v3-low.webp"
                  alt="Twoja Fototapeta – największy wybór bestsellerów"
                  fill
                  priority
                  fetchPriority="high" // ✅ MEJORA LCP: fuerza fetchpriority=high (lo que te pide Lighthouse)
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ BESTSELLERY SLIDER (nuevo) */}
      {Array.isArray(bestsellery) && bestsellery.length > 0 ? (
        <BestsellerySliderClient
          products={bestsellery}
          viewAllHref="/kategoria-produktu/bestsellery"
        />
      ) : null}

      {/* CUERPO (vacío por ahora) */}
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-10" />
      </section>
    </main>
  );
}
