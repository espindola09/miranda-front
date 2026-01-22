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

// ✅ Slider “Tematy” circular
import TematySubcatsSliderClient from "@/components/home/TematySubcatsSliderClient";

// ✅ NUEVO slider independiente
import OstatnioDodaneSliderClient from "@/components/home/OstatnioDodaneSliderClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SubcatItem = {
  id: number;
  name: string;
  slug: string;
  image: string;
  href: string;
};

/**
 * ✅ Soporta ambos formatos:
 * 1) Array directo: [ {...}, {...} ]
 * 2) Objeto: { ok: true, items: [ {...} ] }
 */
function normalizeItems<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && Array.isArray(payload.items)) return payload.items as T[];
  return [];
}

/**
 * ✅ Construye base URL robusto para localhost y Vercel
 * - Vercel: x-forwarded-host / x-forwarded-proto
 * - Local: host normal
 * - Fallback: NEXT_PUBLIC_SITE_URL / VERCEL_URL
 */
function getBaseUrlFromHeaders(h: Headers): string {
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost || h.get("host");

  const forwardedProto = h.get("x-forwarded-proto");
  const proto =
    forwardedProto ||
    (process.env.NODE_ENV === "development" ? "http" : "https");

  const envHost =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!host) {
    if (envHost.startsWith("http")) return envHost;
    if (envHost) return `https://${envHost}`;
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}

export default async function Home() {
  let products: any[] = [];
  let bestsellery: any[] = [];
  let przeznaczeniaSubcats: SubcatItem[] = [];
  let tematySubcats: SubcatItem[] = [];
  let ostatnioDodane: any[] = [];

  try {
    const h = headers();
    const base = getBaseUrlFromHeaders(await h);

    async function safeJson<T>(url: string): Promise<T | null> {
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error(`Fetch failed: ${url} -> ${res.status} ${res.statusText}`, txt.slice(0, 300));
        return null;
      }

      try {
        return (await res.json()) as T;
      } catch (e) {
        console.error(`JSON parse failed: ${url}`, e);
        return null;
      }
    }

    // =========================
    // BESTSELLERY
    // =========================
    const data = await safeJson<any[]>(`${base}/api/bestsellery`);
    products = Array.isArray(data) ? data : [];

    const filtered = (Array.isArray(products) ? products : []).filter((p: any) => {
      const cats = Array.isArray(p?.categories) ? p.categories : [];
      return cats.some((c: any) => {
        const slug = String(c?.slug || "").toLowerCase();
        const name = String(c?.name || "").toLowerCase();
        return slug === "bestsellery" || name === "bestsellery";
      });
    });

    if (!filtered.length) {
      bestsellery = (Array.isArray(products) ? products : []).slice(0, 8);
    } else {
      bestsellery = filtered.slice(0, 12);
    }

    // =========================
    // PRZEZNACZENIA SUBCATS
    // =========================
    const j2 = await safeJson<any>(`${base}/api/przeznaczenia-subcats`);
    przeznaczeniaSubcats = normalizeItems<SubcatItem>(j2);

    // =========================
    // TEMATY SUBCATS
    // =========================
    const j3 = await safeJson<any>(`${base}/api/tematy-subcats`);
    tematySubcats = normalizeItems<SubcatItem>(j3);

    // =========================
    // ✅ OSTATNIO DODANE (Nowości)
    // =========================
    const j4 = await safeJson<any[]>(`${base}/api/ostatnio-dodane`);
    ostatnioDodane = Array.isArray(j4) ? j4 : [];
  } catch (e) {
    console.error("Home fetch failed:", e);
    bestsellery = [];
    przeznaczeniaSubcats = [];
    tematySubcats = [];
    ostatnioDodane = [];
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
        <BestsellerySliderClient products={bestsellery} viewAllHref="/kategoria-produktu/bestsellery" />
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

      {/* ✅ TEMATY SUBCATS SLIDER (CIRCULAR) */}
      {Array.isArray(tematySubcats) && tematySubcats.length > 0 ? (
        <TematySubcatsSliderClient items={tematySubcats} />
      ) : null}

      {/* ✅ NUEVO SLIDER “NOWOŚCI” (ABAJO DE TEMATY) */}
      {Array.isArray(ostatnioDodane) && ostatnioDodane.length > 0 ? (
        <OstatnioDodaneSliderClient products={ostatnioDodane} viewAllHref="/sklep-fototapety" />
      ) : null}

      {/* CUERPO (vacío por ahora) */}
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-10" />
      </section>
    </main>
  );
}
