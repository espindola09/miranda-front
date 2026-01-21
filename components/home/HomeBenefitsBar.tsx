// components/home/HomeBenefitsBar.tsx

import React from "react";

function IconTruck() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 40V18c0-2.2 1.8-4 4-4h26c2.2 0 4 1.8 4 4v22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M42 26h8l6 8v6H42V26Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 46a4 4 0 1 0 8 0a4 4 0 0 0-8 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M44 46a4 4 0 1 0 8 0a4 4 0 0 0-8 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 40h6m10 0h18m0 0h2m12 0h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconReturn() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 20h20v20H22V20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M44 18l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M50 24c0-10-8-18-18-18S14 14 14 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSecure() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 8l18 8v14c0 12-8 22-18 26C22 52 14 42 14 30V16l18-8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M26 32l4 4 10-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Benefit = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

export default function HomeBenefitsBar() {
  const items: Benefit[] = [
    {
      title: "Darmowa Dostawa",
      desc: "Ciesz się darmową dostawą na wybrane zamówienia.\nSzybka realizacja 2–3 dni.",
      icon: <IconTruck />,
    },
    {
      title: "365 dni na zwrot",
      desc: "365 dni na zwrot bez podawania przyczyny dla\nklientów indywidualnych do 200 zł.",
      icon: <IconReturn />,
    },
    {
      title: "Bezpieczna Płatność",
      desc: "Posiadamy certyfikat programu ochrony kupującego i\nbezpieczne płatności.",
      icon: <IconSecure />,
    },
  ];

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center text-black">
                {it.icon}
              </div>

              <h3 className="text-base font-extrabold text-black">
                {it.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-black/70 whitespace-pre-line">
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
