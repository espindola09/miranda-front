"use client";

// components/ulubione/UlubioneModal.tsx
// Modal "Lista życzeń (N)" estilo Woo (según capturas).
// - Se apoya en UlubioneProvider (useUlubione)
// - Cierra con ESC, click afuera y botón "X"
// - Botones: "OTWÓRZ STRONĘ LISTY ŻYCZEŃ" (va a /ulubione) y "KONTYNUUJ ZAKUPY" (cierra)
// - Muestra último agregado (lastAdded) y contador total
// - Respeta HTML de precio (priceHtml) si existe
// ✅ FIX: Footer responsive con gap para que los links nunca queden "pegados" (especialmente en Plakaty)

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useUlubione } from "./UlubioneProvider";

function formatPlDate(iso: string): string {
  // Formato similar a Woo: "15 stycznia, 2026"
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;

    const day = new Intl.DateTimeFormat("pl-PL", { day: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("pl-PL", { month: "long" }).format(d);
    const year = new Intl.DateTimeFormat("pl-PL", { year: "numeric" }).format(d);

    return `${day} ${month}, ${year}`;
  } catch {
    return iso;
  }
}

export default function UlubioneModal() {
  const { isModalOpen, closeModal, count, lastAdded, remove } = useUlubione();

  const item = lastAdded;

  const addedDate = useMemo(() => {
    if (!item?.addedAt) return "";
    return formatPlDate(item.addedAt);
  }, [item?.addedAt]);

  // ESC para cerrar
  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay (click afuera cierra) */}
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-black/60"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative w-[92vw] max-w-170 overflow-hidden rounded-md border border-black/30 bg-white shadow-2xl">
        {/* Header negro */}
        <div className="flex items-center justify-between bg-[#111] px-4 py-3">
          <div className="text-sm font-semibold text-white">
            Lista życzeń ({count})
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded hover:bg-white/10 transition"
          >
            <span className="text-white text-lg leading-none">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <div className="flex items-start gap-4">
            {/* Remove X (izquierda) */}
            <button
              type="button"
              aria-label="Remove"
              className="mt-2 text-black/70 hover:text-black transition"
              onClick={() => {
                if (item?.id) remove(item.id);
              }}
            >
              ×
            </button>

            {/* Miniatura (opcional) */}
            {item?.image ? (
              <div className="h-16 w-16 overflow-hidden rounded border border-black/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item?.name || "Produkt"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#c9b086] truncate">
                {item?.name || "Produkt"}
              </div>

              {/* Precio ✅ dorado para que se lea en fondos oscuros (Plakaty, etc.) */}
              <div className="mt-1 text-sm text-[#c9b086]">
                {item?.priceHtml ? (
                  <span
                    className="wishlist-price-html"
                    dangerouslySetInnerHTML={{ __html: item.priceHtml }}
                  />
                ) : null}
              </div>

              {/* Fecha ✅ dorado suave */}
              {addedDate ? (
                <div className="mt-2 text-sm text-[#c9b086]/80">{addedDate}</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer (links) ✅ FIX spacing + responsive */}
        <div className="border-t border-black/10 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/ulubione"
              className="w-full sm:w-auto text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-[#c9b086] hover:opacity-80 transition"
              onClick={closeModal}
            >
              OTWÓRZ STRONĘ LISTY ŻYCZEŃ
            </Link>

            <button
              type="button"
              className="w-full sm:w-auto text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-[#c9b086] hover:opacity-80 transition"
              onClick={closeModal}
            >
              KONTYNUUJ ZAKUPY
            </button>
          </div>
        </div>
      </div>

      {/* Ajustes mínimos para que del/ins se vean como Woo */}
      <style jsx global>{`
        .wishlist-price-html del {
          opacity: 0.55;
          margin-right: 6px;
        }
        .wishlist-price-html ins {
          text-decoration: none;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
