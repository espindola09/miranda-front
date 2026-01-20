// lib/menu.ts
import { getCategories } from "@/lib/woo";

export type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  image?: { src?: string };
  parent?: number;
};

export type FototapetyMenuData = {
  tematy: MenuCategory[];
  przeznaczenia: MenuCategory[];
  tiles: MenuCategory[]; // 6 con imagen
};

function byName(a: MenuCategory, b: MenuCategory) {
  return a.name.localeCompare(b.name, "pl");
}

export async function getFototapetyMenuData(): Promise<FototapetyMenuData> {
  // 1) Traer categorías (ideal: pedirlas ya ordenadas + con parent)
  const cats = (await getCategories()) as MenuCategory[];

  // 2) Identificar la categoría raíz "Fototapety"
  const root = cats.find((c) => c.slug === "fototapety");
  const rootId = root?.id;

  // 3) Hijas directas -> las usamos como base.
  const children = rootId
    ? cats.filter((c) => c.parent === rootId)
    : [];

  // 4) En tu diseño: "Tematy" (lista larga)
  //    Si vos tenés una hija "tematy" y dentro subcategorías, ajustamos:
  const tematy = children
    .filter((c) => c.slug !== "przeznaczenia")
    .sort(byName);

  // 5) "Przeznaczenia" (si existe categoría hija "przeznaczenia")
  const przeznRoot = children.find((c) => c.slug === "przeznaczenia");
  const przeznaczenia = przeznRoot
    ? cats.filter((c) => c.parent === przeznRoot.id).sort(byName)
    : [];

  // 6) Tiles: 6 categorías con imagen (podés filtrar por una lista fija de slugs)
  const tilesPreferredSlugs = ["drzewa", "dzieci", "miasta", "kwiaty", "gory", "abstrakcja"];
  const tiles = tilesPreferredSlugs
    .map((s) => cats.find((c) => c.slug === s))
    .filter(Boolean) as MenuCategory[];

  return { tematy, przeznaczenia, tiles };
}
