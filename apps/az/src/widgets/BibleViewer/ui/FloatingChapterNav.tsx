"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

interface FloatingChapterNavProps {
  children: ReactNode;
}

export function FloatingChapterNav({ children }: FloatingChapterNavProps) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const minScrollBeforeHide = 80;
    const scrollDelta = 8;

    const updateNavVisibility = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= minScrollBeforeHide) {
        setIsHidden(false);
      } else if (scrollDiff > scrollDelta) {
        setIsHidden(true);
      } else if (scrollDiff < -scrollDelta) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(updateNavVisibility);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!window.matchMedia("(pointer: coarse)").matches) return;
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      setIsHidden(false);
    };

    const showNav = () => setIsHidden(false);

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("focusin", showNav);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("focusin", showNav);
    };
  }, []);

  return (
    <div
      className={cn(
        "lg:hidden fixed inset-x-0 bottom-3 z-40 px-3 pb-[env(safe-area-inset-bottom)] transform-gpu transition-transform duration-300 ease-in-out will-change-transform sm:bottom-3",
        isHidden ? "translate-y-[calc(100%+1.5rem)]" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex max-w-md items-center gap-x-2 rounded-lg border border-stone-200 bg-background/95 p-2 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.65)] backdrop-blur dark:border-white/10">
        {children}
      </div>
    </div>
  );
}
