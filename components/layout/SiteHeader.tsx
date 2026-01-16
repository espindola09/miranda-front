"use client";

import React from "react";
import Link from "next/link";

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M10 18a8 8 0 1 1 5.29-14.01A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0-6-6a6 6 0 0 0 6 6Zm11 5-5.2-5.2 1.4-1.4L22.4 19.6 21 21Z"
      />
    </svg>
  );
}

function IconPhone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M6.6 10.8c1.5 3 3.6 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.6 22 2 13.4 2 3c0-.6.4-1 1-1h3.9c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
      />
    </svg>
  );
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 12a5 5 0 1 1 0-10a5 5 0 0 1 0 10Zm0 2c4.4 0 8 2.2 8 5v2H4v-2c0-2.8 3.6-5 8-5Z"
      />
    </svg>
  );
}

function IconCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M7 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4ZM6.2 6l.6 3h11.1c.5 0 .9.3 1 .7l1 5c.1.6-.3 1.3-1 1.3H8c-.5 0-1-.4-1.1-.9L5 4H2V2h3.6c.5 0 .9.3 1 .8L6.2 6Z"
      />
    </svg>
  );
}

export default function SiteHeader() {
  return (
    <header className="w-full">
      {/* TOP BAR */}
      <div className="bg-[#c9b086] text-black">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-4 text-xs font-semibold tracking-wide">
          <span className="opacity-90">Promocja</span>
          <span className="mx-3 opacity-50">—</span>
          <span className="opacity-90">na wszystko</span>
          <span className="mx-3 opacity-50">|</span>
          <span className="text-red-600 font-extrabold">365 dni na zwrot</span>
          <span className="mx-3 opacity-50">|</span>
          <span className="opacity-90">100 000+ zadowolonych klientów</span>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="bg-white text-black border-b border-black/10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-6">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3">
              {/* Placeholder logo: reemplazalo por tu SVG/PNG */}
              <div className="h-10 w-10 rounded-full border border-[#c9b086] grid place-items-center">
                <span className="text-[#c9b086] font-black">M</span>
              </div>
              <span className="hidden sm:block font-semibold tracking-wide">
                Miranda Morris
              </span>
            </Link>

            {/* MENU (desktop) */}
            <nav className="hidden lg:flex items-center gap-6 text-[13px] font-semibold tracking-wide">
              <Link className="hover:text-[#c9b086] transition" href="/sklep-fototapety">
                FOTOTAPETY
              </Link>
              <Link className="hover:text-[#c9b086] transition" href="/naklejki">
                NAKLEJKI
              </Link>
              <Link className="hover:text-[#c9b086] transition" href="/obrazy-i-plakaty">
                OBRAZY I PLAKATY
              </Link>
              <Link className="hover:text-[#c9b086] transition" href="/moj-projekt">
                MÓJ PROJEKT
              </Link>
              <Link className="hover:text-[#c9b086] transition" href="/blog">
                BLOG
              </Link>
              <Link className="hover:text-[#c9b086] transition" href="/kontakt">
                KONTAKT
              </Link>
            </nav>

            {/* ICONS */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-black/10 hover:border-[#c9b086] hover:text-[#c9b086] transition grid place-items-center"
                aria-label="Szukaj"
                title="Szukaj"
              >
                <IconSearch className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="h-9 w-9 rounded-full border border-black/10 hover:border-[#c9b086] hover:text-[#c9b086] transition grid place-items-center"
                aria-label="Telefon"
                title="Telefon"
              >
                <IconPhone className="h-5 w-5" />
              </button>

              <Link
                href="/moje-konto"
                className="h-9 w-9 rounded-full border border-black/10 hover:border-[#c9b086] hover:text-[#c9b086] transition grid place-items-center"
                aria-label="Moje konto"
                title="Moje konto"
              >
                <IconUser className="h-5 w-5" />
              </Link>

              <Link
                href="/koszyk"
                className="relative h-9 w-9 rounded-full border border-black/10 hover:border-[#c9b086] hover:text-[#c9b086] transition grid place-items-center"
                aria-label="Koszyk"
                title="Koszyk"
              >
                <IconCart className="h-5 w-5" />
                {/* Badge cantidad (placeholder) */}
                <span className="absolute -right-1 -top-1 h-5 min-w-5 px-1 rounded-full bg-[#c9b086] text-black text-[11px] font-extrabold grid place-items-center">
                  0
                </span>
              </Link>

              {/* Mobile menu placeholder */}
              <button
                type="button"
                className="lg:hidden h-9 px-3 rounded-full border border-black/10 hover:border-[#c9b086] transition text-xs font-semibold"
                aria-label="Menu"
              >
                MENU
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
