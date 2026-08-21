"use client";

import { useEffect, useState } from "react";

export type SelectionInfo = {
  text: string;
  rect: DOMRect;
};

const MIN_SELECTION_LENGTH = 2;
const DEBOUNCE_MS = 150;

/**
 * Tracks the current non-empty text selection anywhere on the page.
 * `selectionchange` fires for both mouse-drag and touch selection, so this
 * one hook drives the floating trigger on desktop and mobile alike.
 */
export function useTextSelection(): SelectionInfo | null {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const handleChange = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim() ?? "";

        if (!sel || sel.rangeCount === 0 || text.length < MIN_SELECTION_LENGTH) {
          setSelection(null);
          return;
        }

        const rect = sel.getRangeAt(0).getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          setSelection(null);
          return;
        }

        setSelection({ text, rect });
      }, DEBOUNCE_MS);
    };

    document.addEventListener("selectionchange", handleChange);
    return () => {
      document.removeEventListener("selectionchange", handleChange);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return selection;
}
