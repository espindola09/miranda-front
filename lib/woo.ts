// lib/woo.ts
import "server-only";

const WP_BASE = process.env.WP_BASE_URL!;

/**
 * SECURITY: Separate credentials by capability (catalog vs orders)
 * - Prefer READ-only keys for products/categories.
 * - Use separate ORDERS keys for write operations (future).
 * - Backward compatible with WC_CONSUMER_KEY / WC_CONSUMER_SECRET.
 */
const CK_READ =
  process.env.WC_CONSUMER_KEY_READ ??
  process.env.WC_CONSUMER_KEY ??
  "";
const CS_READ =
  process.env.WC_CONSUMER_SECRET_READ ??
  process.env.WC_CONSUMER_SECRET ??
  "";

const CK_ORDERS =
  process.env.WC_CONSUMER_KEY_ORDERS ??
  CK_READ;
const CS_ORDERS =
  process.env.WC_CONSUMER_SECRET_ORDERS ??
  CS_READ;

type WooAuthMode = "read" | "orders";

type WooFetchOptions = {
  revalidate?: number; // segundos
  tags?: string[]; // para revalidateTag()
  cache?: RequestCache; // 'force-cache' | 'no-store' | ...
  auth?: WooAuthMode; // ✅ qué credenciales usar (default: read)
  method?: "GET" | "POST" | "PUT" | "DELETE"; // para futuro (orders)
};

type CategoryOptions = {
  hideEmpty?: boolean;
  perPage?: number;
};

function assertEnv(auth: WooAuthMode = "read") {
  if (!WP_BASE) throw new Error("Missing env: WP_BASE_URL");

  if (auth === "orders") {
    if (!CK_ORDERS) throw new Error("Missing env: WC_CONSUMER_KEY_ORDERS (or fallback)");
    if (!CS_ORDERS) throw new Error("Missing env: WC_CONSUMER_SECRET_ORDERS (or fallback)");
    return;
  }

  if (!CK_READ) throw new Error("Missing env: WC_CONSUMER_KEY_READ (or WC_CONSUMER_KEY)");
  if (!CS_READ) throw new Error("Missing env: WC_CONSUMER_SECRET_READ (or WC_CONSUMER_SECRET)");
}

// Headers “normales” para evitar challenge/bots.
// No cambia tu autenticación; solo la hace más compatible.
function getAuthHeader(auth: WooAuthMode = "read") {
  const CK = auth === "orders" ? CK_ORDERS : CK_READ;
  const CS = auth === "orders" ? CS_ORDERS : CS_READ;

  return {
    Authorization: "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64"),
    Accept: "application/json",
    "User-Agent": "NextHeadless/Vercel",
  } as Record<string, string>;
}

function normalizeBaseUrl(u: string) {
  return u.replace(/\/+$/, "");
}

function normalizePath(p: string) {
  return p.replace(/^\/+/, "");
}

function looksLikeCloudflareHtml(body: string) {
  const t = body.toLowerCase();
  return (
    body.includes("<!DOCTYPE html") ||
    t.includes("just a moment") ||
    t.includes("cloudflare") ||
    t.includes("cf-ray")
  );
}

async function wooFetch<T = any>(
  path: string,
  params: Record<string, string> = {},
  opts: WooFetchOptions = {}
): Promise<T> {
  const auth: WooAuthMode = opts.auth ?? "read";
  assertEnv(auth);

  const url = new URL(
    `${normalizeBaseUrl(WP_BASE)}/wp-json/wc/v3/${normalizePath(path)}`
  );

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // Defaults: si pasás revalidate => usá force-cache, si no => no-store
  const hasRevalidate = typeof opts.revalidate === "number";
  const cache: RequestCache =
    opts.cache ?? (hasRevalidate ? "force-cache" : "no-store");

  const method = opts.method ?? "GET";

  const res = await fetch(url.toString(), {
    method,
    headers: getAuthHeader(auth),
    cache,
    ...(hasRevalidate || (opts.tags && opts.tags.length)
      ? { next: { revalidate: opts.revalidate, tags: opts.tags } }
      : {}),
  });

  // ERROR PATH
  if (!res.ok) {
    const text = await res.text();

    if (looksLikeCloudflareHtml(text)) {
      throw new Error(
        `Woo API blocked by Cloudflare (HTML challenge). Status ${res.status}. URL: ${url.toString()}`
      );
    }

    throw new Error(`Woo API error ${res.status}: ${text}`);
  }

  // SUCCESS BUT HTML (rare)
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await res.text();

    if (looksLikeCloudflareHtml(text)) {
      throw new Error(
        `Woo API returned HTML (Cloudflare challenge). URL: ${url.toString()}`
      );
    }

    throw new Error(
      `Woo API unexpected content-type "${contentType}". URL: ${url.toString()}`
    );
  }

  return res.json();
}

/* ===========================
   CACHE STRATEGY (ajustable)
   =========================== */

// Categorías cambian poco
const REVALIDATE_CATEGORIES = 60 * 60; // 1 hora

// Producto individual / listados cambian más
const REVALIDATE_PRODUCTS = 5 * 60; // 5 minutos

/* ===========================
   PUBLIC API
   =========================== */

export async function getProducts(limit = 8) {
  return wooFetch(
    "products",
    {
      per_page: String(limit),
      status: "publish",
    },
    {
      revalidate: REVALIDATE_PRODUCTS,
      tags: ["woo:products"],
      auth: "read",
    }
  );
}

export async function getProductBySlug(slug: string) {
  const products = await wooFetch<any[]>(
    "products",
    {
      slug,
      status: "publish",
    },
    {
      revalidate: REVALIDATE_PRODUCTS,
      tags: ["woo:products", `woo:product:slug:${slug}`],
      auth: "read",
    }
  );

  return products?.[0] ?? null;
}

export async function getCategories() {
  return wooFetch(
    "products/categories",
    {
      per_page: "100",
      hide_empty: "true",
    },
    {
      revalidate: REVALIDATE_CATEGORIES,
      tags: ["woo:categories"],
      auth: "read",
    }
  );
}

export async function getCategoryBySlug(slug: string) {
  const cats = await wooFetch<any[]>(
    "products/categories",
    {
      slug,
      per_page: "100",
      hide_empty: "true",
    },
    {
      revalidate: REVALIDATE_CATEGORIES,
      tags: ["woo:categories", `woo:category:slug:${slug}`],
      auth: "read",
    }
  );

  return cats?.[0] ?? null;
}

export async function getCategoriesByParent(
  parentId: number,
  options: CategoryOptions = {}
) {
  const hideEmpty = options.hideEmpty ?? true;
  const perPage = options.perPage ?? 100;

  return wooFetch(
    "products/categories",
    {
      parent: String(parentId),
      per_page: String(perPage),
      hide_empty: hideEmpty ? "true" : "false",
    },
    {
      revalidate: REVALIDATE_CATEGORIES,
      tags: ["woo:categories", `woo:category:parent:${parentId}`],
      auth: "read",
    }
  );
}

/**
 * Trae TODAS las categorías (paginando).
 * Soporta: boolean (compat) o options.
 */
export async function getAllCategories(options: boolean | CategoryOptions = true) {
  const resolved: CategoryOptions =
    typeof options === "boolean" ? { hideEmpty: options } : options;

  const hideEmpty = resolved.hideEmpty ?? true;
  const perPage = resolved.perPage ?? 100;

  let page = 1;
  const all: any[] = [];

  while (true) {
    const chunk = await wooFetch<any[]>(
      "products/categories",
      {
        per_page: String(perPage),
        page: String(page),
        hide_empty: hideEmpty ? "true" : "false",
      },
      {
        revalidate: REVALIDATE_CATEGORIES,
        tags: ["woo:categories", "woo:categories:all"],
        auth: "read",
      }
    );

    if (!Array.isArray(chunk) || chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < perPage) break;

    page += 1;
  }

  return all;
}

export function buildCategoryTree(categories: any[]) {
  const byId = new Map<number, any>();
  const roots: any[] = [];

  categories.forEach((c) => byId.set(c.id, { ...c, children: [] }));

  byId.forEach((node) => {
    const parentId = Number(node.parent || 0);
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (arr: any[]) => {
    arr.sort((a, b) => String(a.name).localeCompare(String(b.name), "pl"));
    arr.forEach((x) => sortRec(x.children || []));
  };
  sortRec(roots);

  return roots;
}

/* ===========================
   NUEVO: Productos por categoría
   =========================== */

export async function getProductsByCategoryId(
  categoryId: number,
  perPage = 24,
  page = 1
) {
  return wooFetch(
    "products",
    {
      category: String(categoryId),
      per_page: String(perPage),
      page: String(page),
      status: "publish",
    },
    {
      revalidate: REVALIDATE_PRODUCTS,
      tags: ["woo:products", `woo:products:category:${categoryId}`],
      auth: "read",
    }
  );
}
