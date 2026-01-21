// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import BestsellerySliderClient from "@/components/home/BestsellerySliderClient";

// ✅ NUEVO: Trustindex (Google Reviews) desde WP
import GoogleReviewsTrustindex from "@/components/home/GoogleReviewsTrustindex";

import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let products: any[] = [];
  let bestsellery: any[] = [];

  try {
    // ✅ URL absoluta al propio host (local o vercel)
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const proto = process.env.NODE_ENV === "development" ? "http" : "https";
    const base = `${proto}://${host}`;

    const r = await fetch(`${base}/api/bestsellery`, { cache: "no-store" });
    const data = await r.json();

    products = Array.isArray(data) ? data : [];

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
    console.error("Bestsellery fetch failed:", e);
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
                      "text-white!",
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
              {/* ✅ MÁS ALTO (real): alturas explícitas para que se note */}
              <div className="relative w-full h-130 sm:h-150 lg:h-180 xl:h-205">
                <Image
                  src="https://drukdekoracje.pl/wp-content/uploads/2025/11/AdobeStock_6609484541HD-v3-low.webp"
                  alt="Twoja Fototapeta – największy wybór bestsellerów"
                  fill
                  priority
                  fetchPriority="high"
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

      {/* ✅ GOOGLE REVIEWS (Trustindex desde WP) */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0f172a]">
              To nas wyróżnia
            </h2>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm md:text-base text-black/80">
              <span>Ocena</span>
              <span className="font-semibold">5,0</span>
              <span className="inline-flex items-center gap-1" aria-label="Ocena 5 na 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-[#f2c200] text-base leading-none">
                    ★
                  </span>
                ))}
              </span>
              <span>na podstawie opinii z Google</span>
            </div>
          </div>

          {/* Render real del shortcode desde WP */}
          <GoogleReviewsTrustindex wpBaseUrl="https://drukdekoracje.pl" />
        </div>
      </section>

      {/* CUERPO (vacío por ahora) */}
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-10" />
      </section>
    </main>
  );
}
