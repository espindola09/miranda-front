import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Seguridad mínima opcional por header (puedes activarla luego)
    // const secret = req.headers.get("x-revalidate-secret");
    // if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
    //   return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    // }

    const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];

    // Si no vienen paths, revalidamos lo básico (ajusta si querés)
    if (paths.length === 0) {
      revalidatePath("/sklep-fototapety");
      revalidatePath("/kategoria-produktu");
      return NextResponse.json({
        ok: true,
        revalidated: ["/sklep-fototapety", "/kategoria-produktu"],
      });
    }

    paths.forEach((p) => revalidatePath(p));
    return NextResponse.json({ ok: true, revalidated: paths });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
