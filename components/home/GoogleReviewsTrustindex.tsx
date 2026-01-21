"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  // Dominio del back WP donde está Trustindex instalado (tu caso: drukdekoracje.pl)
  wpBaseUrl: string;
};

type ApiResponse = {
  ok: boolean;
  html?: string;
  css_url?: string;
  js_url?: string;
  error?: string;
};

function ensureCssOnce(href: string) {
  if (!href) return;
  const id = `mm-ti-css:${href}`;
  if (document.querySelector(`link[data-mm-ti="${id}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-mm-ti", id);
  document.head.appendChild(link);
}

/**
 * Carga un script exactamente una vez. Si ya existe, retorna.
 * NO sirve para "re-init". Para re-init usamos injectTrustindexLoader().
 */
function ensureScriptOnce(src: string, onLoad?: () => void) {
  if (!src) return;
  const id = `mm-ti-js:${src}`;
  const existing = document.querySelector(
    `script[data-mm-ti="${id}"]`
  ) as HTMLScriptElement | null;

  if (existing) {
    if (existing.getAttribute("data-loaded") === "1") onLoad?.();
    else existing.addEventListener("load", () => onLoad?.(), { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  script.setAttribute("data-mm-ti", id);
  script.addEventListener(
    "load",
    () => {
      script.setAttribute("data-loaded", "1");
      onLoad?.();
    },
    { once: true }
  );

  document.body.appendChild(script);
}

/**
 * Re-inicialización fiable:
 * - elimina un loader anterior de Trustindex que hayamos inyectado
 * - inyecta uno nuevo con cache-bust
 * Trustindex se re-evalúa y vuelve a construir el widget sobre el markup ya presente.
 */
function injectTrustindexLoader(src: string) {
  if (!src) return;

  // removemos cualquier loader previo que hayamos metido para evitar duplicado
  const prev = document.querySelector('script[data-mm-ti-reinit="1"]') as HTMLScriptElement | null;
  if (prev && prev.parentNode) prev.parentNode.removeChild(prev);

  const s = document.createElement("script");
  s.src = src + (src.includes("?") ? "&" : "?") + "v=" + Date.now(); // cache-bust
  s.async = true;
  s.defer = true;
  s.setAttribute("data-mm-ti-reinit", "1");
  document.body.appendChild(s);
}

function htmlContainsTrustindexLoader(rawHtml: string) {
  const h = String(rawHtml || "").toLowerCase();
  return h.includes("cdn.trustindex.io/loader.js");
}

export default function GoogleReviewsTrustindex({ wpBaseUrl }: Props) {
  const [error, setError] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  const endpoint = useMemo(() => {
    const base = wpBaseUrl.replace(/\/$/, "");
    return `${base}/wp-json/mm/v1/trustindex-google`;
  }, [wpBaseUrl]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      try {
        setError("");

        const res = await fetch(endpoint, { method: "GET", cache: "no-store" });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          setError(`Trustindex endpoint HTTP ${res.status}${txt ? `: ${txt}` : ""}`);
          return;
        }

        const data = (await res.json()) as ApiResponse;

        if (!data?.ok) {
          setError(data?.error || "Trustindex endpoint failed");
          return;
        }

        const widgetHtml = String(data.html || "");

        // 1) Inyectamos HTML DIRECTO en el contenedor (garantiza que esté debajo del título)
        if (containerRef.current) {
          containerRef.current.innerHTML = widgetHtml;
        }

        // 2) CSS
        const cssUrl =
          data.css_url && data.css_url.length
            ? data.css_url
            : `${wpBaseUrl.replace(/\/$/, "")}/wp-content/uploads/trustindex-google-widget.css`;
        ensureCssOnce(cssUrl);

        // 3) Loader
        const jsUrl =
          data.js_url && data.js_url.length
            ? data.js_url
            : "https://cdn.trustindex.io/loader.js?4afb27c628c9804a98867d7b06c";

        const alreadyHasLoader = htmlContainsTrustindexLoader(widgetHtml);

        // Si el HTML NO trae loader, lo cargamos una vez y luego reinit seguro
        if (!alreadyHasLoader) {
          ensureScriptOnce(jsUrl, () => {
            // el loader pudo cargar antes del innerHTML por timing; forzamos re-init seguro
            injectTrustindexLoader(jsUrl);
          });
        } else {
          // Si el HTML ya trae loader, igual forzamos una reinicialización segura
          // porque React/Next a veces inserta tarde el HTML respecto del script.
          injectTrustindexLoader(jsUrl);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load Google reviews");
      }
    })();
  }, [endpoint, wpBaseUrl]);

  return (
    <div>
      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* ✅ ESTE contenedor es donde queda SIEMPRE el widget, justo debajo del título */}
      <div ref={containerRef} className="mt-10" />
    </div>
  );
}
