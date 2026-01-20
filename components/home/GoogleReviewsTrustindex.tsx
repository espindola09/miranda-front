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

function ensureScriptOnce(src: string, onLoad?: () => void) {
  if (!src) return;
  const id = `mm-ti-js:${src}`;
  const existing = document.querySelector(`script[data-mm-ti="${id}"]`) as HTMLScriptElement | null;

  if (existing) {
    // Si ya está cargado, igual ejecutamos callback
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

export default function GoogleReviewsTrustindex({ wpBaseUrl }: Props) {
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string>("");
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

        const res = await fetch(endpoint, {
          method: "GET",
          // Importante: si Cloudflare mete cache agresivo, evitamos cache acá
          cache: "no-store",
        });

        const data = (await res.json()) as ApiResponse;

        if (!data?.ok) {
          setError(data?.error || "Trustindex endpoint failed");
          return;
        }

        const widgetHtml = String(data.html || "");
        setHtml(widgetHtml);

        // CSS: si WP lo devuelve, lo usamos; si no, intentamos el path estándar en uploads.
        const cssUrl =
          data.css_url && data.css_url.length
            ? data.css_url
            : `${wpBaseUrl.replace(/\/$/, "")}/wp-content/uploads/trustindex-google-widget.css`;

        ensureCssOnce(cssUrl);

        // JS loader
        const jsUrl = data.js_url || "https://cdn.trustindex.io/loader.js?wp-widget";

        // Cargar script y luego “re-disparar” el init:
        ensureScriptOnce(jsUrl, () => {
          // Trustindex suele inicializar al cargar el script.
          // En algunos casos, al inyectar HTML después, hace falta forzar reflow.
          // Re-insertamos un trigger div si existe el modo template. Si no, igual funciona en la mayoría.
          try {
            // No hay API pública documentada estable; lo más seguro es forzar un “DOM mutation”
            // que el loader detecta.
            const marker = document.createElement("div");
            marker.style.display = "none";
            marker.setAttribute("data-mm-ti-refresh", "1");
            document.body.appendChild(marker);
            marker.remove();
          } catch {}
        });
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

      {/* El HTML viene renderizado por WP desde el shortcode */}
      <div
        className="mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
