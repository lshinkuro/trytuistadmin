"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";
const KEY = "tt-admin-theme";
const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<Theme, string> = { system: "Tema: ikuti sistem", light: "Tema: terang", dark: "Tema: gelap" };

// Sumber kebenaran = atribut data-theme di <html> (dipasang script di layout sebelum render).
function read(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" || t === "dark" ? t : "system";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);

  const toggle = () => {
    const next = NEXT[theme];
    if (next === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // storage diblokir: tema tetap berlaku sampai halaman dimuat ulang
    }
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-neutral-soft hover:text-ink"
      aria-label={LABEL[theme]}
      title={LABEL[theme]}
    >
      <Icon className="size-4" />
    </button>
  );
}
