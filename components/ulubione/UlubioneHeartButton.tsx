"use client";

// components/ulubione/UlubioneHeartButton.tsx
// Botón corazón (icon-only) para agregar/quitar producto de "Ulubione".
// - Abre el modal global al agregar (comportamiento tipo Woo).
// - Evita Hydration mismatch: no calcula "active" hasta hidratar.
// - ✅ Optimizado para theme CLARO (blanco/negro) + dorado.

import React, { useEffect, useMemo, useState } from "react";
import { useUlubione } from "@/components/ulubione/UlubioneProvider";

type Props = {
  id: number;
  slug?: string;
  name?: string;
  image?: string;
  priceHtml?: string;
  className?: string;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 21s-7.5-4.6-10-9.4C.2 8.1 2.1 4.8 5.6 4.2c1.9-.3 3.7.5 4.8 1.9 1.1-1.4 2.9-2.2 4.8-1.9 3.5.6 5.4 3.9 3.6 7.4C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

export default function UlubioneHeartButton({
  id,
  slug,
  name,
  image,
  priceHtml,
  className,
}: Props) {
  const { has, toggle } = useUlubione();

  // ✅ Evita mismatch: hasta hidratar, renderizamos SIEMPRE "no activo"
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const active = useMemo(() => {
    if (!hydrated) return false;
    return has(id);
  }, [hydrated, has, id]);

  return (
    <button
      type="button"
      className={[
        "inline-flex items-center justify-center",
        "rounded-2xl border border-black/10 bg-white text-black",
        "hover:bg-black/5 transition shadow-sm",
        "px-4 py-3 min-w-14",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b086]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className || "",
      ].join(" ")}
      aria-label={active ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      title={active ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      onClick={() => {
        toggle({ id, slug, name, image, priceHtml });
      }}
    >
      {/* ✅ Icono visible en theme claro:
          - Inactivo: negro (con hover dorado)
          - Activo: dorado sólido */}
      <span
        className={[
          "inline-flex",
          active
            ? "text-[#c9b086]"
            : "text-black hover:text-[#c9b086] transition-colors",
        ].join(" ")}
      >
        <HeartIcon filled={active} />
      </span>
    </button>
  );
}
