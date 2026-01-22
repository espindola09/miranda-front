// app/api/ostatnio-dodane/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WooCat = {
  id: number;
  slug: string;
};

function wpBase() {
  return process.env.WP_BASE_URL || "https://drukdekoracje.pl";
}

/** ✅ nunca Authorization undefined */
function wcAuthHeaders(): Record<string, string> {
  const key = process.env.WC_CONSUMER_KEY || "";
  const secret = process.env.WC_CONSUMER_SECRET || "";
  if (!key || !secret) return {};
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function wcFetch<T>(path: string): Promise<T> {
  const url = `${wpBase()}/wp-json/wc/v3${path}`;

  const auth = wcAuthHeaders();
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(Object.keys(auth).length ? auth : {}),
  };

  const res = await fetch(url, { cache: "no-store", headers });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`WC ${path} failed: ${res.status} ${res.statusText} ${txt}`);
  }

  return (await res.json()) as T;
}

export async function GET() {
  try {
    // ======================================================
    // OPCIÓN A (igual que tu MU-plugin): últimos de 1 categoría
    // ======================================================
    const cats = await wcFetch<WooCat[]>(
      `/products/categories?slug=bestsellery&per_page=1&hide_empty=false`
    );

    const catId = Array.isArray(cats) && cats.length ? cats[0].id : null;
    if (!catId) return NextResponse.json([], { status: 200 });

    const products = await wcFetch<any[]>(
      `/products?category=${catId}&orderby=date&order=desc&per_page=15&status=publish`
    );

    // ======================================================
    // OPCIÓN B (si querés últimos agregados GLOBAL, sin categoría)
    // - Comentar Opción A y usar esto:
    // const products = await wcFetch<any[]>(
    //   `/products?orderby=date&order=desc&per_page=15&status=publish`
    // );
    // ======================================================

    return NextResponse.json(Array.isArray(products) ? products : [], { status: 200 });
  } catch (e: any) {
    console.error("API /ostatnio-dodane error:", e);
    return NextResponse.json([], { status: 200 });
  }
}
