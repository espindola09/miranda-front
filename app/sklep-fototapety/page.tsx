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
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  // Compatibilidad: en algunas versiones puede venir como Promise
  const sp = await Promise.resolve(searchParams);

  const page = getPageFromSearchParams(sp);

  // “Filtro” por querystring:
  const catSlug = asString(sp.cat) || ""; // categoría principal (ej: fototapety)
  const subSlug = asString(sp.sub) || ""; // hija (ej: inspiracje)
  const leafSlug = asString(sp.leaf) || ""; // nieta (ej: do-salonu) opcional

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
      activeSub ? activeSub.children || [] : activeTop.children || [],
      leafSlug
    );
    if (leaf) activeNode = leaf;
  }

  const products = await getProductsByCategoryId(activeNode.id, 24, page);

  // Menú estilo WP: hijos del top seleccionado
  const childrenLevel1 = activeTop.children || [];

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-black/60 mb-6">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black/70">Sklep fototapety</span>
          <span className="mx-2">/</span>
          <span className="text-black font-semibold">{activeNode.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="text-lg font-semibold text-black">Kategorie</div>
              <div className="text-xs text-black/60 mt-1">Wybierz sekcję sklepu</div>

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
                          ? "border-[#c9b086] bg-[#c9b086]/10"
                          : "border-black/10 bg-white hover:border-[#c9b086] hover:bg-black/2",
                      ].join(" ")}
                    >
                      <span className="font-medium text-black">{c.name}</span>
                      <span className="text-xs text-black/50">{c.count}</span>
                    </Link>
                  );
                })}
              </div>

              {/* SUBMENU estilo WP: hijos del top seleccionado */}
              {childrenLevel1.length ? (
                <>
                  <div className="mt-6 border-t border-black/10 pt-4">
                    <div className="text-sm font-semibold text-black">{activeTop.name}</div>

                    <div className="mt-3 space-y-2">
                      {childrenLevel1.map((child: any) => {
                        const isSubActive =
                          activeSub?.id === child.id || (!activeSub && activeNode.id === child.id);

                        const hasChildren = (child.children || []).length > 0;

                        return (
                          <div
                            key={child.id}
                            className="rounded-2xl border border-black/10 bg-white"
                          >
                            <Link
                              href={`/sklep-fototapety?cat=${encodeURIComponent(
                                activeTop.slug
                              )}&sub=${encodeURIComponent(child.slug)}`}
                              className={[
                                "flex items-center justify-between px-4 py-3 rounded-2xl transition",
                                isSubActive
                                  ? "bg-[#c9b086]/10"
                                  : "hover:bg-black/2",
                              ].join(" ")}
                            >
                              <span className="font-medium text-black">{child.name}</span>
                              <span className="text-xs text-black/50">
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
                                        href={`/sklep-fototapety?cat=${encodeURIComponent(
                                          activeTop.slug
                                        )}&sub=${encodeURIComponent(
                                          child.slug
                                        )}&leaf=${encodeURIComponent(leaf.slug)}`}
                                        className={[
                                          "block rounded-xl px-3 py-2 text-sm border transition",
                                          isLeafActive
                                            ? "border-[#c9b086] bg-[#c9b086]/10 text-black"
                                            : "border-transparent text-black/70 hover:text-black hover:bg-black/2",
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
                  <div className="mt-6 border-t border-black/10 pt-4">
                    <div className="text-xs text-black/60 mb-2">Linki do pełnych kategorii:</div>
                    <div className="text-sm space-y-1">
                      <Link
                        className="block text-black/70 hover:text-black underline decoration-[#c9b086]"
                        href={`/kategoria-produktu/${activeTop.slug}`}
                      >
                        /kategoria-produktu/{activeTop.slug}
                      </Link>

                      {activeSub ? (
                        <Link
                          className="block text-black/70 hover:text-black underline decoration-[#c9b086]"
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
            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-black">
                Odkryj świat fototapet – odmień
                <br />
                swoje wnętrze w mgnieniu oka
              </h1>

              <p className="mt-4 max-w-3xl text-black/70">
                W naszym sklepie znajdziesz fototapety na wymiar, naklejki ścienne, obrazy na płótnie i plakaty.
                Wybierz kategorię po lewej albo przejdź do pełnych list kategorii.
              </p>

              <div className="mt-5 text-black/70 text-sm">
                Wyświetlanie produktów dla kategorii:{" "}
                <span className="font-semibold text-black">{activeNode.name}</span>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="mt-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">Produkty</h2>
                <div className="text-sm text-black/60">
                  Lista produktów w wybranej kategorii.
                </div>
              </div>

              <Link
                href={`/sklep-fototapety?cat=${encodeURIComponent(activeTop.slug)}`}
                className="text-sm text-black/70 hover:text-black underline decoration-[#c9b086]"
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
                    className="
                      group rounded-3xl border border-black/10 bg-white overflow-hidden transition
                      hover:border-[#c9b086] hover:shadow-md
                    "
                  >
                    <div className="relative w-full pt-[62.5%] bg-black/3 overflow-hidden">
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
                      <div className="font-semibold text-black line-clamp-2">{p.name}</div>
                      <div className="mt-2 text-black/70">
                        <span className="text-[#c9b086] font-semibold">{p.price}</span>{" "}
                        <span className="text-black/50">zł</span>
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
                  className="px-4 py-2 rounded-full border border-black/15 bg-white hover:border-[#c9b086] hover:bg-[#c9b086]/10 transition"
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
                className="px-4 py-2 rounded-full border border-black/15 bg-white hover:border-[#c9b086] hover:bg-[#c9b086]/10 transition"
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
