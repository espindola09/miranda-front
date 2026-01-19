"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-white border-t border-[#c9b086]/40 mt-20">
      {/* CONTENIDO PRINCIPAL */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* BLOQUE LOGO / MEDAL */}
          <div>
            <img
              src="https://drukdekoracje.pl/wp-content/uploads/2025/03/medal-2002-text.png.webp"
              alt="Od 2002 roku – 23 lata na rynku"
              className="w-40 h-auto"
              loading="lazy"
            />

            <div className="mt-6 text-sm text-black leading-relaxed space-y-1">
              <div>
                <strong>Adres:</strong> Oczapowskiego 9, Olsztyn
              </div>
              <div>
                <strong>E-mail:</strong>{" "}
                <a
                  href="mailto:kontakt@drukdekoracje.pl"
                  className="text-[#c9b086] hover:underline"
                >
                  kontakt@drukdekoracje.pl
                </a>
              </div>
              <div>
                <strong>Telefon:</strong>{" "}
                <a
                  href="tel:+48576245560"
                  className="text-[#c9b086] hover:underline"
                >
                  +48 576 245 560
                </a>
              </div>
            </div>

            {/* SOCIAL */}
            <div className="mt-6 flex items-center gap-4 text-black">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-[#c9b086] transition"
              >
                <i className="fab fa-facebook-f" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-[#c9b086] transition"
              >
                <i className="fab fa-instagram" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="hover:text-[#c9b086] transition"
              >
                <i className="fab fa-tiktok" />
              </a>
            </div>

            <div className="mt-6 text-sm text-black">
              <strong>NIP:</strong> 741 156 22 17
            </div>
          </div>

          {/* FIRMA */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Firma
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/o-nas" className="hover:text-[#c9b086] transition">
                  O nas
                </Link>
              </li>
              <li>
                <Link href="/opinie" className="hover:text-[#c9b086] transition">
                  Opinie
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-[#c9b086] transition">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* ZAMÓWIENIA */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Zamówienia
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dostawa" className="hover:text-[#c9b086] transition">
                  Dostawa
                </Link>
              </li>
              <li>
                <Link
                  href="/platnosci"
                  className="hover:text-[#c9b086] transition"
                >
                  Płatności
                </Link>
              </li>
              <li>
                <Link
                  href="/reklamacje"
                  className="hover:text-[#c9b086] transition"
                >
                  Reklamacje i zwroty
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-[#c9b086] transition"
                >
                  Najczęściej zadawane pytania
                </Link>
              </li>
              <li>
                <Link
                  href="/regulamin"
                  className="hover:text-[#c9b086] transition"
                >
                  Regulamin i polityka prywatności
                </Link>
              </li>
            </ul>
          </div>

          {/* USŁUGI I PRODUKTY */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Usługi i produkty
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/fototapety"
                  className="hover:text-[#c9b086] transition"
                >
                  Fototapety
                </Link>
              </li>
              <li>
                <Link
                  href="/naklejki"
                  className="hover:text-[#c9b086] transition"
                >
                  Naklejki ścienne
                </Link>
              </li>
              <li>
                <Link
                  href="/plakaty"
                  className="hover:text-[#c9b086] transition"
                >
                  Plakaty
                </Link>
              </li>
              <li>
                <Link
                  href="/obrazy"
                  className="hover:text-[#c9b086] transition"
                >
                  Obrazy
                </Link>
              </li>
              <li>
                <Link
                  href="/wlasny-plakat"
                  className="hover:text-[#c9b086] transition"
                >
                  Własny plakat
                </Link>
              </li>
              <li>
                <Link
                  href="/wlasny-obraz"
                  className="hover:text-[#c9b086] transition"
                >
                  Własny obraz na płótnie
                </Link>
              </li>
              <li>
                <Link
                  href="/dekoratorka"
                  className="hover:text-[#c9b086] transition"
                >
                  Wirtualna Dekoratorka Wnętrz
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-[#c9b086]/40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-black">
          <div>Copyright © 2026 Graften.pl</div>

          <div className="flex items-center gap-4">
            <img src="/payments/visa.svg" alt="Visa" className="h-5" />
            <img src="/payments/mastercard.svg" alt="Mastercard" className="h-5" />
            <img src="/payments/applepay.svg" alt="Apple Pay" className="h-5" />
            <img src="/payments/googlepay.svg" alt="Google Pay" className="h-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}