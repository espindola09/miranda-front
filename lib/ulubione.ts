// lib/ulubione.ts
// Ulubione (Wishlist) storage helpers (front-only) for Next.js (App Router)
// - Persistencia en localStorage (invitados)
// - Guarda: id, slug (opcional), name/img/priceHtml (opcionales para modal rápido), addedAt (ISO)
// - NO depende de React (helpers puros)
// - Seguro ante SSR: nunca toca window/localStorage si no existe

export type UlubioneItem = {
  id: number; // Woo product id (recomendado)
  slug?: string;
  name?: string;
  image?: string; // url
  priceHtml?: string;
  addedAt: string; // ISO date string
};

export type UlubioneState = {
  version: 1;
  items: UlubioneItem[];
};

const STORAGE_KEY = "mm_ulubione_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeId(id: unknown): number {
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function dedupeById(items: UlubioneItem[]): UlubioneItem[] {
  const map = new Map<number, UlubioneItem>();
  for (const it of items) {
    const id = normalizeId(it?.id);
    if (!id) continue;

    // Mantener el registro más “completo” si hay duplicados
    const prev = map.get(id);
    if (!prev) {
      map.set(id, { ...it, id });
      continue;
    }

    const merged: UlubioneItem = {
      ...prev,
      ...it,
      id,
      // conservar addedAt más antiguo si existe
      addedAt:
        prev.addedAt && it.addedAt
          ? new Date(prev.addedAt) <= new Date(it.addedAt)
            ? prev.addedAt
            : it.addedAt
          : prev.addedAt || it.addedAt || new Date().toISOString(),
    };

    map.set(id, merged);
  }
  return Array.from(map.values());
}

export function readUlubioneState(): UlubioneState {
  const empty: UlubioneState = { version: 1, items: [] };

  if (!isBrowser()) return empty;

  const parsed = safeJsonParse<UlubioneState>(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.items)) return empty;

  const items = dedupeById(
    parsed.items
      .map((x) => ({
        id: normalizeId((x as any)?.id),
        slug: typeof (x as any)?.slug === "string" ? (x as any).slug : undefined,
        name: typeof (x as any)?.name === "string" ? (x as any).name : undefined,
        image: typeof (x as any)?.image === "string" ? (x as any).image : undefined,
        priceHtml:
          typeof (x as any)?.priceHtml === "string" ? (x as any).priceHtml : undefined,
        addedAt:
          typeof (x as any)?.addedAt === "string" && (x as any).addedAt
            ? (x as any).addedAt
            : new Date().toISOString(),
      }))
      .filter((it) => it.id > 0)
  );

  return { version: 1, items };
}

export function writeUlubioneState(state: UlubioneState): void {
  if (!isBrowser()) return;

  const safe: UlubioneState = {
    version: 1,
    items: dedupeById(Array.isArray(state?.items) ? state.items : []),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // si el storage falla (quota/privado), no rompemos UX
  }
}

export function getUlubioneItems(): UlubioneItem[] {
  return readUlubioneState().items;
}

export function hasInUlubione(id: number): boolean {
  const pid = normalizeId(id);
  if (!pid) return false;
  return getUlubioneItems().some((it) => normalizeId(it.id) === pid);
}

export function addToUlubione(item: Partial<UlubioneItem> & { id: number }): UlubioneItem[] {
  const pid = normalizeId(item?.id);
  if (!pid) return getUlubioneItems();

  const state = readUlubioneState();
  const now = new Date().toISOString();

  const newItem: UlubioneItem = {
    id: pid,
    slug: typeof item.slug === "string" ? item.slug : undefined,
    name: typeof item.name === "string" ? item.name : undefined,
    image: typeof item.image === "string" ? item.image : undefined,
    priceHtml: typeof item.priceHtml === "string" ? item.priceHtml : undefined,
    addedAt: typeof item.addedAt === "string" && item.addedAt ? item.addedAt : now,
  };

  const items = dedupeById([newItem, ...state.items]).sort((a, b) => {
    // más recientes primero
    const da = new Date(a.addedAt).getTime();
    const db = new Date(b.addedAt).getTime();
    return db - da;
  });

  writeUlubioneState({ version: 1, items });
  return items;
}

export function removeFromUlubione(id: number): UlubioneItem[] {
  const pid = normalizeId(id);
  if (!pid) return getUlubioneItems();

  const state = readUlubioneState();
  const items = state.items.filter((it) => normalizeId(it.id) !== pid);

  writeUlubioneState({ version: 1, items });
  return items;
}

export function toggleUlubione(
  item: Partial<UlubioneItem> & { id: number }
): { items: UlubioneItem[]; active: boolean } {
  const pid = normalizeId(item?.id);
  if (!pid) return { items: getUlubioneItems(), active: false };

  const exists = hasInUlubione(pid);
  if (exists) {
    const items = removeFromUlubione(pid);
    return { items, active: false };
  }

  const items = addToUlubione({ ...item, id: pid });
  return { items, active: true };
}

export function clearUlubione(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/**
 * Utilidad: permite escuchar cambios entre tabs/ventanas (storage event).
 * Retorna una función unsubscribe.
 */
export function subscribeUlubioneStorageChange(
  cb: (items: UlubioneItem[]) => void
): () => void {
  if (!isBrowser()) return () => {};

  const handler = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cb(getUlubioneItems());
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
