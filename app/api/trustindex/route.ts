import { NextResponse } from "next/server";

export const runtime = "nodejs"; // importante en Vercel

export async function GET() {
  try {
    const wpEndpoint = "https://drukdekoracje.pl/wp-json/mm/v1/trustindex-google";

    const r = await fetch(wpEndpoint, {
      method: "GET",
      // Evita caches raras entre Cloudflare/Vercel
      cache: "no-store",
      headers: {
        // User-Agent ayuda con algunos WAF
        "User-Agent": "Mozilla/5.0 (Headless Next.js Proxy)",
        Accept: "application/json",
      },
    });

    const text = await r.text();

    if (!r.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `WP HTTP ${r.status}`,
          details: text.slice(0, 500),
        },
        { status: 200 }
      );
    }

    // WP devuelve JSON; lo reenviamos tal cual
    return new NextResponse(text, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Proxy failed" },
      { status: 200 }
    );
  }
}
