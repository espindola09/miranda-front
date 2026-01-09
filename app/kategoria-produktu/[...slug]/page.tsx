import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, buildCategoryTree, getProductsByCategoryId } from "@/lib/woo";

type SearchParams = Record<string, string | string[] | undefined>;

function getPageFromSearchParams(sp: SearchParams) {
  const raw = sp?.page;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value || "1");
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function findChildBySlug(nodes: any[], slug: string) {
  return (nodes || []).find((n) => n.slug === slug) ?? null;
}

function resolvePath(treeRoots: any[], path: string[]) {
  // path: ["fototapety", "inspiracje", "do-salonu", ...]
  if (!path?.length) return { active: null, top: null };

  const top = findChildBySlug(treeRoots, path[0]);
  if (!top) return { active: null, top: null };

  let active = top;
  for (let i = 1; i < path.length; i++) {
    const next = findChildBySlug(active.children || [], path[i]);
    if (!next) return { active: null, top: null };
    active = next;
  }

  return { active, top };
}

function buildPageHref(sp: SearchParams, newPage: number) {
  const next = new URLSearchParams();

  Object.entries(sp).forEach(([k, v]) => {
    const val = Array.isArray(v) ? v[0] : v;
    if (!val) return;
    if (k === "page") return;
    next.set(k, val);
  });

  next.set("page", String(newPage));
  return `?${next.toString()}`;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  // IMPORTANTÍSIMO: en tu Next te está llegando como Promise
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const page = getPageFromSearchParams(sp);

  // Traemos TODAS las categorías para armar el árbol y resolver el path
  // OJO: hideEmpty=false para no “perder” categorías.
  const allCats = await getAllCategories({ hideEmpty: false });
  const tree = buildCategoryTree(allCats);

  const { active, top } = resolvePath(tree, slug || []);
  if (!active || !top) notFound();

  // Hijas directas del nodo activo (para mostrar subcategorías como WP)
  const children = active.children || [];

  // Productos de la categoría activa
  const products = await getProductsByCategoryId(active.id, 24, page);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-white/60 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white/80">Kategoria produktu</span>
          {slug?.map((s, i) => (
            <span key={s}>
              <span className="mx-2">/</span>
              <span className="text-white">{s}</span>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* SIDEBAR: estilo WP (top actual + subcategorías) */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="text-lg font-semibold">Kategorie</div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/60">Aktualna kategoria</div>
                <div className="text-lg font-bold">{active.name}</div>
              </div>

              {/* Subcategorías directas del nodo activo */}
              {children.length ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-white/90 mb-3">
                    Podkategorie
                  </div>

                  <div className="space-y-2">
                    {children.map((c: any) => (
                      <Link
                        key={c.id}
                        href={`/kategoria-produktu/${[...slug, c.slug].join("/")}`}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-white/10 transition"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-white/60">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-white/60">
                  Brak podkategorii.
                </div>
              )}

              {/* Link útil de volver al top de esta rama */}
              <div className="mt-6 border-t border-white/10 pt-4">
                <Link
                  href={`/kategoria-produktu/${top.slug}`}
                  className="text-sm text-white/70 hover:text-white underline"
                >
                  Wróć do: {top.name}
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <section>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              {active.name}
            </h1>

            {/* Descripción (si existe) */}
            {active.description ? (
              <div
                className="mt-4 max-w-4xl text-white/80 leading-relaxed prose prose-invert"
                dangerouslySetInnerHTML={{ __html: active.description }}
              />
            ) : null}

            {/* Productos */}
            <div className="mt-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Produkty</h2>
                <div className="text-sm text-white/60">
                  Lista produktów w wybranej kategorii.
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(products || []).map((p: any) => {
                const img = p.images?.[0]?.src || "";
                return (
                  <Link
                    key={p.id}
                    href={`/produkt/${p.slug}`}
                    className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
                  >
                    <div className="relative w-full pt-[62.5%] bg-black/40 overflow-hidden">
                      <div className="absolute inset-0">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover block"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="font-semibold text-white/95 line-clamp-2">
                        {p.name}
                      </div>
                      <div className="mt-2 text-white/70">{p.price} zł</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* PAGINACIÓN */}
            <div className="mt-10 flex items-center gap-3">
              {page > 1 ? (
                <Link
                  href={buildPageHref(sp, page - 1)}
                  className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
                >
                  Prev
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-white/10 text-white/40">
                  Prev
                </span>
              )}

              <span className="text-white/70">Page {page}</span>

              <Link
                href={buildPageHref(sp, page + 1)}
                className="px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                Next
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
