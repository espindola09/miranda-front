// app/api/tematy-subcats/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WooCat = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  image?: { src?: string } | null;
};

function wpBase() {
  return process.env.WP_BASE_URL || "https://drukdekoracje.pl";
}

/**
 * ✅ Nunca devolvemos Authorization: undefined.
 * Si faltan keys, devolvemos {}.
 */
function wcAuthHeaders(): Record<string, string> {
  const key = process.env.WC_CONSUMER_KEY || "";
  const secret = process.env.WC_CONSUMER_SECRET || "";
  if (!key || !secret) return {};

  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function wcFetch<T>(path: string): Promise<T> {
  const base = wpBase();
  const url = `${base}/wp-json/wc/v3${path}`;

  const auth = wcAuthHeaders();
  const headers: HeadersInit = {
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0 (Next.js Proxy)", // ✅ ayuda con algunos WAF
    ...(Object.keys(auth).length ? auth : {}),
  };

  const res = await fetch(url, {
    cache: "no-store",
    headers,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `WC ${path} failed: ${res.status} ${res.statusText} :: ${txt.slice(0, 300)}`
    );
  }

  return (await res.json()) as T;
}

export async function GET() {
  try {
    // 1) Encontrar la categoría padre por slug=tematy
    const parents = await wcFetch<WooCat[]>(
      `/products/categories?slug=tematy&per_page=100&hide_empty=false`
    );

    const parent = Array.isArray(parents) && parents.length ? parents[0] : null;
    const parentId = parent?.id;

    if (!parentId) {
      // ✅ NO es un error técnico: es falta de datos (slug no existe en ese WP)
      return NextResponse.json(
        {
          ok: true,
          items: [],
          reason: "Parent category 'tematy' not found (slug=tematy).",
          env: {
            WP_BASE_URL: wpBase(),
            HAS_WC_KEYS: Boolean(
              process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET
            ),
          },
        },
        { status: 200 }
      );
    }

    // 2) Traer subcategorías por parent=<id>
    const subcats = await wcFetch<WooCat[]>(
      `/products/categories?parent=${parentId}&per_page=100&hide_empty=false`
    );

    const items = (Array.isArray(subcats) ? subcats : []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image?.src || "",
      href: `/kategoria-produktu/${c.slug}`,
    }));

    return NextResponse.json(
      {
        ok: true,
        items,
        parent: { id: parentId, name: parent?.name, slug: parent?.slug },
        env: {
          WP_BASE_URL: wpBase(),
          HAS_WC_KEYS: Boolean(
            process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET
          ),
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    // ✅ si falla en Vercel, ahora lo vas a VER en el navegador
    console.error("API /tematy-subcats error:", e?.message || e);

    return NextResponse.json(
      {
        ok: false,
        items: [],
        error: e?.message || "Unknown error",
        env: {
          WP_BASE_URL: wpBase(),
          HAS_WC_KEYS: Boolean(
            process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET
          ),
        },
      },
      { status: 200 }
    );
  }
}
