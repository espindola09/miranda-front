import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.WP_BASE_URL;
  const ck = process.env.WC_CONSUMER_KEY;
  const cs = process.env.WC_CONSUMER_SECRET;

  if (!base || !ck || !cs) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing env vars: WP_BASE_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET",
      },
      { status: 500 }
    );
  }

  const url = new URL(`${base}/wp-json/wc/v3/products`);
  url.searchParams.set("per_page", "5");
  url.searchParams.set("status", "publish");

  const auth = Buffer.from(`${ck}:${cs}`).toString("base64");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, status: res.status, error: text },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ ok: true, count: data.length, data });
}
