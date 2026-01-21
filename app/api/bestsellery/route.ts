import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Resp = { ok: boolean; products?: any[]; error?: string };

export async function GET(req: Request) {
  try {
    const url = "https://drukdekoracje.pl/wp-json/mm/v1/bestsellery?per_page=30";

    const r = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Next.js Proxy)",
      },
    });

    const data = (await r.json()) as Resp;

    if (!data?.ok || !Array.isArray(data.products)) {
      return NextResponse.json({ ok: false, error: data?.error || "Invalid response" }, { status: 200 });
    }

    return NextResponse.json(data.products, { headers: { "cache-control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Proxy failed" }, { status: 200 });
  }
}
