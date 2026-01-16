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
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-black/60 mb-6">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black/70">Kategoria produktu</span>
          {slug?.map((s, i) => (
            <span key={`${s}-${i}`}>
              <span className="mx-2">/</span>
              <span className="text-black">{s}</span>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* SIDEBAR: estilo WP (top actual + subcategorías) */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-black">Kategorie</div>

              <div className="mt-4 rounded-2xl border border-black/10 bg-black/2 p-4">
                <div className="text-xs text-black/60">Aktualna kategoria</div>
                <div className="text-lg font-bold text-black">{active.name}</div>
              </div>

              {/* Subcategorías directas del nodo activo */}
              {children.length ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-black mb-3">
                    Podkategorie
                  </div>

                  <div className="space-y-2">
                    {children.map((c: any) => (
                      <Link
                        key={c.id}
                        href={`/kategoria-produktu/${[...slug, c.slug].join("/")}`}
                        className="
                          flex items-center justify-between rounded-2xl
                          border border-black/10 bg-white
                          px-4 py-3 transition
                          hover:border-[#c9b086] hover:bg-[#c9b086]/8
                        "
                      >
                        <span className="font-medium text-black">{c.name}</span>
                        <span className="text-xs text-black/60">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-black/60">Brak podkategorii.</div>
              )}

              {/* Link útil de volver al top de esta rama */}
              <div className="mt-6 border-t border-black/10 pt-4">
                <Link
                  href={`/kategoria-produktu/${top.slug}`}
                  className="text-sm text-black/70 hover:text-black underline decoration-[#c9b086]/70 underline-offset-4"
                >
                  Wróć do: <span className="text-[#c9b086] font-semibold">{top.name}</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <section>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-black">
              {active.name}
            </h1>

            {/* Descripción (si existe) */}
            {active.description ? (
              <div
                className="mt-4 max-w-4xl text-black/80 leading-relaxed prose prose-neutral"
                dangerouslySetInnerHTML={{ __html: active.description }}
              />
            ) : null}

            {/* Productos */}
            <div className="mt-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">Produkty</h2>
                <div className="text-sm text-black/60">
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
                    className="
                      group rounded-3xl border border-black/10 bg-white overflow-hidden
                      transition hover:border-[#c9b086] hover:shadow-md
                    "
                  >
                    <div className="relative w-full pt-[62.5%] bg-black/5 overflow-hidden">
                      <div className="absolute inset-0">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-black/40 text-sm">
                            No image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="font-semibold text-black line-clamp-2">
                        {p.name}
                      </div>

                      <div className="mt-2 text-black/80">
                        <span className="text-[#c9b086] font-semibold">{p.price}</span>{" "}
                        <span className="text-black/70">zł</span>
                      </div>
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
                  className="
                    px-4 py-2 rounded-full border border-black/15 bg-white
                    hover:border-[#c9b086] hover:bg-[#c9b086]/10
                    transition
                  "
                >
                  Prev
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-full border border-black/10 text-black/40">
                  Prev
                </span>
              )}

              <span className="text-black/70">Page {page}</span>

              <Link
                href={buildPageHref(sp, page + 1)}
                className="
                  px-4 py-2 rounded-full border border-black/15 bg-white
                  hover:border-[#c9b086] hover:bg-[#c9b086]/10
                  transition
                "
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
