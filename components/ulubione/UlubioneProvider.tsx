"use client";

// components/ulubione/UlubioneProvider.tsx
// Provider global para "Ulubione" (wishlist) en Next.js App Router.
// - Mantiene estado sincronizado con localStorage (via lib/ulubione.ts)
// - Expone acciones: add/remove/toggle/clear
// - Permite abrir/cerrar un modal global (para replicar UX tipo Woo: "Lista życzeń (N)")
// - No asume estilos: el modal se renderiza aparte (UlubioneModal) usando el estado del provider

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { UlubioneItem } from "@/lib/ulubione";
import {
  addToUlubione,
  clearUlubione,
  getUlubioneItems,
  hasInUlubione,
  removeFromUlubione,
  subscribeUlubioneStorageChange,
  toggleUlubione,
} from "@/lib/ulubione";

type UlubioneContextValue = {
  items: UlubioneItem[];
  count: number;

  // Para UI (corazón activo/inactivo)
  has: (id: number) => boolean;

  // Acciones
  add: (item: Partial<UlubioneItem> & { id: number }) => void;
  remove: (id: number) => void;
  toggle: (
    item: Partial<UlubioneItem> & { id: number }
  ) => { active: boolean };

  clear: () => void;

  // Modal global (tipo Woo)
  isModalOpen: boolean;
  lastAdded: UlubioneItem | null;

  openModal: (item?: UlubioneItem | null) => void;
  closeModal: () => void;
};

const UlubioneContext = createContext<UlubioneContextValue | null>(null);

export function useUlubione() {
  const ctx = useContext(UlubioneContext);
  if (!ctx) {
    throw new Error("useUlubione must be used within <UlubioneProvider />");
  }
  return ctx;
}

export default function UlubioneProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<UlubioneItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<UlubioneItem | null>(null);

  // Evita "setState" doble en StrictMode al montar (no rompe, solo reduce ruido)
  const didInit = useRef(false);

  // 1) Cargar items iniciales desde localStorage
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const initial = getUlubioneItems();
    setItems(Array.isArray(initial) ? initial : []);
  }, []);

  // 2) Sincronizar cambios desde otras pestañas/ventanas
  useEffect(() => {
    const unsub = subscribeUlubioneStorageChange((next) => {
      setItems(Array.isArray(next) ? next : []);
    });
    return () => unsub();
  }, []);

  const count = items.length;

  const has = useCallback((id: number) => {
    return hasInUlubione(id);
  }, []);

  const add = useCallback((item: Partial<UlubioneItem> & { id: number }) => {
    const next = addToUlubione(item);
    setItems(Array.isArray(next) ? next : []);

    // lastAdded (para modal)
    const pid = Number(item?.id || 0);
    const found = next.find((x) => Number(x?.id || 0) === pid) || null;
    setLastAdded(found);
    setIsModalOpen(true);
  }, []);

  const remove = useCallback((id: number) => {
    const next = removeFromUlubione(id);
    setItems(Array.isArray(next) ? next : []);
  }, []);

  const toggle = useCallback(
    (item: Partial<UlubioneItem> & { id: number }) => {
      const res = toggleUlubione(item);
      setItems(Array.isArray(res.items) ? res.items : []);

      if (res.active) {
        const pid = Number(item?.id || 0);
        const found =
          res.items.find((x) => Number(x?.id || 0) === pid) || null;
        setLastAdded(found);
        setIsModalOpen(true);
      }

      return { active: res.active };
    },
    []
  );

  const clear = useCallback(() => {
    clearUlubione();
    setItems([]);
    setLastAdded(null);
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback((item?: UlubioneItem | null) => {
    if (item) setLastAdded(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = useMemo<UlubioneContextValue>(
    () => ({
      items,
      count,

      has,
      add,
      remove,
      toggle,
      clear,

      isModalOpen,
      lastAdded,
      openModal,
      closeModal,
    }),
    [
      items,
      count,
      has,
      add,
      remove,
      toggle,
      clear,
      isModalOpen,
      lastAdded,
      openModal,
      closeModal,
    ]
  );

  return (
    <UlubioneContext.Provider value={value}>
      {children}
    </UlubioneContext.Provider>
  );
}
