import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const body = await req.json().catch(() => ({}));

  if (!secret || body?.secret !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // tags a invalidar (ej: ["woo:categories"] o ["woo:product:slug:abc"])
  const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];

  if (!tags.length) {
    return NextResponse.json({ ok: false, error: "No tags provided" }, { status: 400 });
  }

  tags.forEach((t) => revalidateTag(t));

  return NextResponse.json({ ok: true, revalidated: tags });
}
