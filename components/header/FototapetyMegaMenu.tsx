// components/header/FototapetyMegaMenu.tsx
import Link from "next/link";
import Image from "next/image";
import { getFototapetyMenuData } from "@/lib/menu";

export default async function FototapetyMegaMenu() {
  const data = await getFototapetyMenuData();

  return (
    <div className="relative group">
      {/* Trigger */}
      <Link
        href="/sklep-fototapety"
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#c9b086] hover:text-black"
      >
        FOTOTAPETY <span className="text-xs">▾</span>
      </Link>

      {/* Panel: siempre en DOM, sin parpadeo */}
      <div
        className={[
          "absolute left-0 top-full z-50 w-275 max-w-[calc(100vw-48px)]",
          "rounded-md bg-white shadow-xl ring-1 ring-black/5",
          "opacity-0 invisible pointer-events-none translate-y-2",
          "transition duration-150 ease-out",
          "group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0",
          "group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0",
        ].join(" ")}
      >
        <div className="grid grid-cols-[260px_1fr_1fr_320px] gap-10 p-8">
          {/* Col 1: Polecane */}
          <div>
            <div className="text-xs font-semibold tracking-widest text-black/60">POLECANE</div>

            <div className="mt-4 space-y-2 text-sm">
              <Link className="block hover:underline" href="/fototapety-porady">
                Rodzaje fototapet - porady
              </Link>

              <Link className="mt-4 inline-flex items-center gap-2 font-semibold hover:underline" href="/sklep-fototapety">
                <span className="inline-block h-4 w-4 border border-black/30" />
                Pokaż wszystkie
              </Link>

              <div className="mt-4 text-sm font-semibold">Bestsellery - pokaż wszystkie</div>
            </div>
          </div>

          {/* Col 2: Tematy */}
          <div>
            <div className="text-xs font-semibold tracking-widest text-black/60">Tematy</div>
            <div className="mt-4 max-h-85 space-y-2 overflow-auto pr-2 text-sm">
              {data.tematy.map((c) => (
                <Link
                  key={c.id}
                  href={`/kategoria-produktu/${c.slug}`}
                  className="block hover:underline"
                >
                  {c.name}
                </Link>
              ))}

              <Link href="/kategoria-produktu/fototapety" className="mt-3 block font-semibold hover:underline">
                Pokaż wszystkie
              </Link>
            </div>
          </div>

          {/* Col 3: Przeznaczenia */}
          <div>
            <div className="text-xs font-semibold tracking-widest text-black/60">Przeznaczenia</div>
            <div className="mt-4 max-h-85 space-y-2 overflow-auto pr-2 text-sm">
              {data.przeznaczenia.map((c) => (
                <Link
                  key={c.id}
                  href={`/kategoria-produktu/${c.slug}`}
                  className="block hover:underline"
                >
                  {c.name}
                </Link>
              ))}

              <Link href="/kategoria-produktu/przeznaczenia" className="mt-3 block font-semibold hover:underline">
                Pokaż wszystkie
              </Link>
            </div>
          </div>

          {/* Col 4: Tiles */}
          <div>
            <div className="grid grid-cols-3 gap-4">
              {data.tiles.map((c) => (
                <Link
                  key={c.id}
                  href={`/kategoria-produktu/${c.slug}`}
                  className="group/tile text-center"
                >
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-xl bg-black/5">
                    {c.image?.src ? (
                      <Image
                        src={c.image.src}
                        alt={c.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-200 group-hover/tile:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-black">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* “Bridge” anti-flicker: evita que al mover mouse se cierre por un gap */}
        <div className="absolute -top-2 left-0 h-2 w-full" />
      </div>
    </div>
  );
}
