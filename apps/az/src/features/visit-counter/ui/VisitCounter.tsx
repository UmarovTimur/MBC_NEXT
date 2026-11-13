"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

// Only the production site counts; localhost, previews and copies show nothing.
const COUNTER_HOSTS = ["incilaz.com", "www.incilaz.com"];
const STORAGE_KEY = "visit-counted-on";

// One request per page load: client-side navigations remount the footer, but
// this module-level promise survives them.
let request: Promise<number | null> | null = null;

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function readCountedOn(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeCountedOn(date: string) {
  try {
    localStorage.setItem(STORAGE_KEY, date);
  } catch {
    // Storage blocked (private mode etc.) — at worst the visit counts again.
  }
}

async function loadTotal(): Promise<number | null> {
  const date = today();
  const countToday = readCountedOn() !== date;
  try {
    const res = await fetch("/api/visits/", { method: countToday ? "POST" : "GET", cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { total?: unknown };
    if (typeof data.total !== "number") return null;
    // Only remember the visit once the server actually counted it.
    if (countToday) writeCountedOn(date);
    return data.total;
  } catch {
    return null;
  }
}

export function VisitCounter({ locale = "az" }: { locale?: string }) {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!COUNTER_HOSTS.includes(window.location.hostname)) return;
    request ??= loadTotal();
    let alive = true;
    request.then((n) => {
      if (alive) setTotal(n);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (total === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] tabular-nums text-muted-foreground">
      <Users aria-hidden className="size-3.5" />
      {new Intl.NumberFormat(locale).format(total)}
    </span>
  );
}
