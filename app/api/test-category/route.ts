import { NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/woo";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "";

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing ?slug=" }, { status: 400 });
  }

  try {
    const cat = await getCategoryBySlug(slug);
    return NextResponse.json({ ok: true, slug, cat });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, slug, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
