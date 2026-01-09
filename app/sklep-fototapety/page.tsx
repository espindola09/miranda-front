import Link from "next/link";
import { getAllCategories, buildCategoryTree, getProductsByCategoryId } from "@/lib/woo";
import { notFound } from "next/navigation";

function asString(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function getPageFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams?.page;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value || "1");
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function findBySlug(nodes: any[], slug: string): any | null {
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const hit = findBySlug(n.children || [], slug);
    if (hit) return hit;
  }
  return null;
}

function flattenChildren(node: any): any[] {
  const out: any[] = [];
  const walk = (n: any) => {
    (n.children || []).forEach((c: any) => {
      out.push(c);
      walk(c);
    });
  };
  walk(node);
  return out;
}

export default async function SklepFototapetyPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  // Compatibilidad: en algunas versiones puede venir como Promise
  const sp = await Promise.resolve(searchParams);

  const page = getPageFromSearchParams(sp);

  // “Filtro” por querystring:
  const catSlug = asString(sp.cat) || "";     // categoría principal (ej: fototapety)
  const subSlug = asString(sp.sub) || "";     // hija (ej: inspiracje)
  const leafSlug = asString(sp.leaf) || "";   // nieta (ej: do-salonu) opcional

  /**
   * CLAVE:
   * Para poder ver hijas tipo "Inspiracje/Przeznaczenia/Tematy"
   * necesitas traer categorías aunque estén vacías: hideEmpty=false.
   */
  const allCats = await getAllCategories({ hideEmpty: false });
  const tree = buildCategoryTree(allCats as any);

  // Top-level (parent=0). Si querés restringir a 5 como tu screenshot, lo ajustamos por slug.
  const top = tree.filter((c: any) => Number(c.parent || 0) === 0);

  if (!top.length) notFound();

  // Default: si no viene cat, usamos la primera categoría top-level
  const activeTop = catSlug ? findBySlug(top, catSlug) : top[0];
  if (!activeTop) notFound();

  // Subcategoría seleccionada (solo dentro de activeTop)
  const activeSub = subSlug ? findBySlug(activeTop.children || [], subSlug) : null;

  // Niveles:
  // - Si hay leaf => mostramos leaf
  // - sino si hay sub => mostramos sub
  // - sino => mostramos top
  let activeNode = activeTop;
  if (activeSub) activeNode = activeSub;

  if (leafSlug) {
    const leaf = findBySlug(
      activeSub ? (activeSub.children || []) : (activeTop.children || []),
      leafSlug
    );
    if (leaf) activeNode = leaf;
  }

  const products = await getProductsByCategoryId(activeNode.id, 24, page);

  // Menú estilo WP: hijos del top seleccionado
  const childrenLevel1 = activeTop.children || [];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-white/60 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white/80">Sklep fototapety</span>
          <span className="mx-2">/</span>
          <span className="text-white">{activeNode.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="text-lg font-semibold">Kategorie</div>
              <div className="text-xs text-white/60 mt-1">Wybierz sekcję sklepu</div>

              {/* TOP LEVEL */}
              <div className="mt-4 space-y-2">
                {top.slice(0, 12).map((c: any) => {
                  const isActive = c.id === activeTop.id;
                  return (
                    <Link
                      key={c.id}
                      href={`/sklep-fototapety?cat=${encodeURIComponent(c.slug)}`}
                      className={[
                        "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                        isActive
                          ? "border-white/20 bg-white/10"
                          : "border-white/10 bg-black/20 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-white/60">{c.count}</span>
                    </Link>
                  );
                })}
              </div>

              {/* SUBMENU estilo WP: hijos del top seleccionado */}
              {childrenLevel1.length ? (
                <>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="text-sm font-semibold text-white/90">
                      {activeTop.name}
                    </div>

                    <div className="mt-3 space-y-2">
                      {childrenLevel1.map((child: any) => {
                        const isSubActive =
                          activeSub?.id === child.id || (!activeSub && activeNode.id === child.id);

                        const hasChildren = (child.children || []).length > 0;

                        return (
                          <div key={child.id} className="rounded-2xl border border-white/10 bg-black/20">
                            <Link
                              href={`/sklep-fototapety?cat=${encodeURIComponent(activeTop.slug)}&sub=${encodeURIComponent(child.slug)}`}
                              className={[
                                "flex items-center justify-between px-4 py-3 rounded-2xl transition",
                                isSubActive ? "bg-white/10" : "hover:bg-white/10",
                              ].join(" ")}
                            >
                              <span className="font-medium">{child.name}</span>
                              <span className="text-xs text-white/60">
                                {hasChildren ? "▸" : child.count}
                              </span>
                            </Link>

                            {/* Nietas */}
                            {hasChildren ? (
                              <div className="px-4 pb-3">
                                <div className="mt-1 space-y-1">
                                  {(child.children || []).slice(0, 40).map((leaf: any) => {
                                    const isLeafActive = activeNode.id === leaf.id;
                                    return (
                                      <Link
                                        key={leaf.id}
                                        href={`/sklep-fototapety?cat=${encodeURIComponent(activeTop.slug)}&sub=${encodeURIComponent(child.slug)}&leaf=${encodeURIComponent(leaf.slug)}`}
                                        className={[
                                          "block rounded-xl px-3 py-2 text-sm border transition",
                                          isLeafActive
                                            ? "border-white/20 bg-white/10 text-white"
                                            : "border-transparent text-white/70 hover:text-white hover:bg-white/10",
                                        ].join(" ")}
                                      >
                                        {leaf.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Links a la vista “SEO” por ruta real */}
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="text-xs text-white/60 mb-2">Linki do pełnych kategorii:</div>
                    <div className="text-sm space-y-1">
                      <Link
                        className="block text-white/70 hover:text-white underline"
                        href={`/kategoria-produktu/${activeTop.slug}`}
                      >
                        /kategoria-produktu/{activeTop.slug}
                      </Link>

                      {activeSub ? (
                        <Link
                          className="block text-white/70 hover:text-white underline"
                          href={`/kategoria-produktu/${activeTop.slug}/${activeSub.slug}`}
                        >
                          /kategoria-produktu/{activeTop.slug}/{activeSub.slug}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </aside>

          {/* MAIN */}
          <section>
            {/* HERO / intro */}
            <div className="rounded-3xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Odkryj świat fototapet – odmień
                <br />
                swoje wnętrze w mgnieniu oka
              </h1>

              <p className="mt-4 max-w-3xl text-white/75">
                W naszym sklepie znajdziesz fototapety na wymiar, naklejki ścienne, obrazy na płótnie i plakaty.
                Wybierz kategorię po lewej albo przejdź do pełnych list kategorii.
              </p>

              <div className="mt-5 text-white/80 text-sm">
                Wyświetlanie produktów dla kategorii:{" "}
                <span className="font-semibold text-white">{activeNode.name}</span>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="mt-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Produkty</h2>
                <div className="text-sm text-white/60">Lista produktów w wybranej kategorii.</div>
              </div>

              <Link
                href={`/sklep-fototapety?cat=${encodeURIComponent(activeTop.slug)}`}
                className="text-sm text-white/70 hover:text-white underline"
              >
                Wyczyść filtr
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((p: any) => {
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
                      <div className="font-semibold text-white/95 line-clamp-2">{p.name}</div>
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

function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  newPage: number
) {
  const sp = new URLSearchParams();

  Object.entries(searchParams).forEach(([k, v]) => {
    const val = Array.isArray(v) ? v[0] : v;
    if (!val) return;
    if (k === "page") return;
    sp.set(k, val);
  });

  sp.set("page", String(newPage));
  return `/sklep-fototapety?${sp.toString()}`;
}
