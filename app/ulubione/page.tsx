// app/ulubione/page.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useUlubione } from "@/components/ulubione/UlubioneProvider";

function formatDatePL(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function UlubionePage() {
  const { items, remove, clear } = useUlubione();

  const rows = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    arr.sort((a: any, b: any) => {
      const da = new Date(a?.addedAt || 0).getTime();
      const db = new Date(b?.addedAt || 0).getTime();
      return db - da;
    });
    return arr;
  }, [items]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Ulubione
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Twoje zapisane produkty ({items.length})
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white/85 hover:bg-white/10 transition"
          >
            Wróć do sklepu
          </Link>

          <button
            type="button"
            onClick={clear}
            disabled={!items.length}
            className={[
              "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white/85 hover:bg-white/10 transition",
              !items.length ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            Wyczyść
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-8">
        {!items.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Brak ulubionych produktów.
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {rows.map((it, idx) => {
              const href = it.slug ? `/produkt/${it.slug}` : "/";
              const dateText = formatDatePL(it.addedAt);

              return (
                <div
                  key={it.id}
                  className={[
                    "grid items-center gap-4 px-4 py-3",
                    "grid-cols-[24px_48px_1fr]",
                    "border-t border-white/10",
                    idx === 0 ? "border-t-0" : "",
                  ].join(" ")}
                >
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="text-white/50 hover:text-white transition"
                    aria-label="Usuń"
                    title="Usuń"
                  >
                    ×
                  </button>

                  {/* Miniatura REAL */}
                  <Link href={href} className="block">
                    <div className="h-12 w-12 rounded-md bg-black/30 border border-white/10 grid place-items-center overflow-hidden">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image}
                          alt={it.name || "Produkt"}
                          className="max-h-10 max-w-10 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs text-white/40">—</span>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="min-w-0">
                    <Link
                      href={href}
                      className="block text-sm font-semibold text-[#c9b086] hover:underline truncate"
                    >
                      {it.name || "Produkt"}
                    </Link>

                    {it.priceHtml ? (
                      <div
                        className="mt-0.5 text-sm text-white/80"
                        dangerouslySetInnerHTML={{ __html: it.priceHtml }}
                      />
                    ) : null}

                    {dateText ? (
                      <div className="mt-0.5 text-xs text-white/60">
                        {dateText}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
