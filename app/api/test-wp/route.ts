import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.WP_BASE_URL;

  if (!base) {
    return NextResponse.json(
      { ok: false, error: "WP_BASE_URL is not set in .env.local" },
      { status: 500 }
    );
  }

  const url = `${base}/wp-json/wp/v2/pages?per_page=1`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { ok: false, status: res.status, error: text },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json({ ok: true, sample: data });
}

