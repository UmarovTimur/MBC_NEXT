"use client";

import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { useHideOnScroll } from "@/shared/lib/useHideOnScroll";

interface FloatingChapterNavProps {
  children: ReactNode;
}

export function FloatingChapterNav({ children }: FloatingChapterNavProps) {
  const isHidden = useHideOnScroll();

  return (
    <div
      className={cn(
        // Rides above the bottom audio player when it is open (--audio-bar-h).
        // `translate`, not `transform`: Tailwind v4's translate-y-* sets the standalone property.
        "lg:hidden fixed inset-x-0 bottom-[calc(var(--audio-bar-h,0px)+0.75rem)] z-40 px-3 pb-[env(safe-area-inset-bottom)] transform-gpu transition-[translate,bottom] duration-300 ease-in-out will-change-transform",
        isHidden ? "translate-y-[calc(100%+1.5rem+var(--audio-bar-h,0px))]" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex max-w-md items-center gap-x-2 rounded-lg border border-stone-200 bg-background/95 p-2 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.65)] backdrop-blur dark:border-white/10">
        {children}
      </div>
    </div>
  );
}
