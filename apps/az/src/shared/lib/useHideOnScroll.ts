"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SCROLL_BEFORE_HIDE = 80;
const SCROLL_DELTA = 8;

/**
 * Hides on scroll down and shows again on scroll up, near the top of the page,
 * on touch, and when focus moves (so keyboard users never tab into hidden chrome).
 * Every caller reacts to the same events, so header, chapter nav and audio player
 * hide and reappear together.
 */
export function useHideOnScroll(): boolean {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= MIN_SCROLL_BEFORE_HIDE) {
        setIsHidden(false);
      } else if (scrollDiff > SCROLL_DELTA) {
        setIsHidden(true);
      } else if (scrollDiff < -SCROLL_DELTA) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(updateVisibility);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!window.matchMedia("(pointer: coarse)").matches) return;
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      setIsHidden(false);
    };

    const show = () => setIsHidden(false);

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("focusin", show);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("focusin", show);
    };
  }, []);

  return isHidden;
}
