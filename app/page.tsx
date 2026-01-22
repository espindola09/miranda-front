// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import BestsellerySliderClient from "@/components/home/BestsellerySliderClient";

// ✅ Trustindex (Google Reviews) desde WP
import GoogleReviewsTrustindex from "@/components/home/GoogleReviewsTrustindex";

import { headers } from "next/headers";

// ✅ Slider 5 categorías (ya lo tenés)
import CategoryFiveSlider from "@/components/home/CategoryFiveSlider";

// ✅ Barra beneficios (ya lo tenés)
import HomeBenefitsBar from "@/components/home/HomeBenefitsBar";

// ✅ Slider “Przeznaczenia” (ya lo tenés)
import PrzeznaczeniaSubcatsSliderClient from "@/components/home/PrzeznaczeniaSubcatsSliderClient";

// ✅ NUEVO: Slider “Tematy” circular
import TematySubcatsSliderClient from "@/components/home/TematySubcatsSliderClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SubcatItem = {
  id: number;
  name: string;
  slug: string;
  image: string;
  href: string;
};

type ApiListResp = {
  ok?: boolean;
  items?: SubcatItem[];
  error?: string;
  reason?: string;
};

export default async function Home() {
  let products: any[] = [];
  let bestsellery: any[] = [];
  let przeznaczeniaSubcats: SubcatItem[] = [];
  let tematySubcats: SubcatItem[] = [];

  try {
    // ✅ Construimos base URL ABSOLUTA (sirve igual en localhost y en Vercel)
    const h = await headers();
    const host = h.get("host") || "localhost:3000";

    // ✅ En Vercel/producción, forzamos https
    // ✅ En dev local, http
    const proto = process.env.NODE_ENV === "development" ? "http" : "https";
    const base = `${proto}://${host}`;

    // =========================
    // BESTSELLERY
    // =========================
    const r = await fetch(`${base}/api/bestsellery`, { cache: "no-store" });

    if (!r.ok) {
      throw new Error(`GET /api/bestsellery failed: ${r.status} ${r.statusText}`);
    }

    const data = await r.json();
    products = Array.isArray(data) ? data : [];

    bestsellery = (Array.isArray(products) ? products : []).filter((p: any) => {
      const cats = Array.isArray(p?.categories) ? p.categories : [];
      return cats.some((c: any) => {
        const slug = String(c?.slug || "").toLowerCase();
        const name = String(c?.name || "").toLowerCase();
        return slug === "bestsellery" || name === "bestsellery";
      });
    });

    if (!bestsellery.length) {
      bestsellery = (Array.isArray(products) ? products : []).slice(0, 8);
    } else {
      bestsellery = bestsellery.slice(0, 12);
    }

    // =========================
    // PRZEZNACZENIA SUBCATS
    // ✅ Tu estaba el bug: la API devuelve { ok, items }
    // =========================
    const r2 = await fetch(`${base}/api/przeznaczenia-subcats`, { cache: "no-store" });
    if (r2.ok) {
      const j2 = (await r2.json()) as ApiListResp | SubcatItem[];

      // ✅ soporta ambos formatos:
      // - array directo (legacy)
      // - { ok, items } (actual)
      if (Array.isArray(j2)) {
        przeznaczeniaSubcats = j2 as SubcatItem[];
      } else {
        przeznaczeniaSubcats = Array.isArray(j2?.items) ? (j2.items as SubcatItem[]) : [];
      }
    }

    // =========================
    // TEMATY SUBCATS
    // ✅ Misma corrección que arriba
    // =========================
    const r3 = await fetch(`${base}/api/tematy-subcats`, { cache: "no-store" });
    if (r3.ok) {
      const j3 = (await r3.json()) as ApiListResp | SubcatItem[];

      if (Array.isArray(j3)) {
        tematySubcats = j3 as SubcatItem[];
      } else {
        tematySubcats = Array.isArray(j3?.items) ? (j3.items as SubcatItem[]) : [];
      }
    }
  } catch (e) {
    console.error("Home fetch failed:", e);
    bestsellery = [];
    przeznaczeniaSubcats = [];
    tematySubcats = [];
  }

  return (
    <main className="w-full bg-white">
      {/* HERO */}
      <section className="w-full">
        <div className="w-full border-b border-[#c9b086]/60">
          <div className="grid w-full grid-cols-1 lg:grid-cols-[420px_1fr]">
            {/* PANEL IZQUIERDO */}
            <div className="bg-[#f3eee6] px-6 py-12 lg:px-14 lg:py-20">
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

      {/* ✅ BESTSELLERY SLIDER */}
      {Array.isArray(bestsellery) && bestsellery.length > 0 ? (
        <BestsellerySliderClient
          products={bestsellery}
          viewAllHref="/kategoria-produktu/bestsellery"
        />
      ) : null}

      {/* ✅ GOOGLE REVIEWS */}
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

          <GoogleReviewsTrustindex wpBaseUrl="https://drukdekoracje.pl" />
        </div>
      </section>

      {/* ✅ SLIDER 5 CATEGORÍAS */}
      <CategoryFiveSlider />

      {/* ✅ BENEFITS BAR */}
      <HomeBenefitsBar />

      {/* ✅ PRZEZNACZENIA SUBCATS SLIDER */}
      {Array.isArray(przeznaczeniaSubcats) && przeznaczeniaSubcats.length > 0 ? (
        <PrzeznaczeniaSubcatsSliderClient items={przeznaczeniaSubcats} />
      ) : null}

      {/* ✅ TEMATY SUBCATS SLIDER (CIRCULAR) — debajo del anterior */}
      {Array.isArray(tematySubcats) && tematySubcats.length > 0 ? (
        <TematySubcatsSliderClient items={tematySubcats} />
      ) : null}

      {/* CUERPO (vacío por ahora) */}
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-10" />
      </section>
    </main>
  );
}
