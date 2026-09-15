"use client";

import { useEffect } from "react";

/**
 * Verse anchoring, highlighting and copy-to-clipboard.
 *
 * Operates purely on the DOM that the assembled chapter HTML already carries —
 * every verse segment is a `<span class="v" data-v="n">`, with the first one also
 * holding `id="V{n}"`. No verse data is fetched.
 *
 * CSS `:target` alone cannot do this: 41% of verses span more than one block and
 * emit several wrappers, and only the first can carry the id (duplicate ids would
 * break the anchor). So the active class is applied to every wrapper with the
 * matching `data-v`.
 */

const ACTIVE = "is-active";

function versesFor(root: ParentNode, n: number): HTMLElement[] {
  const exact = Array.from(root.querySelectorAll<HTMLElement>(`.v[data-v="${n}"]`));
  if (exact.length > 0) return exact;

  // 30 verses in azb carry a range label ("16-17") under a single numeric id, so
  // #V17 has no anchor of its own — fall back to the range that contains it.
  return Array.from(root.querySelectorAll<HTMLElement>(".v[data-v-end]")).filter((el) => {
    const start = Number(el.dataset.v);
    const end = Number(el.dataset.vEnd);
    return Number.isFinite(start) && Number.isFinite(end) && n >= start && n <= end;
  });
}

export function VerseHighlight() {
  useEffect(() => {
    const apply = (scroll: boolean) => {
      document
        .querySelectorAll<HTMLElement>(`.v.${ACTIVE}`)
        .forEach((el) => el.classList.remove(ACTIVE));

      const match = /^#V(\d+)$/.exec(window.location.hash);
      if (!match) return;

      const targets = versesFor(document, Number(match[1]));
      targets.forEach((el) => el.classList.add(ACTIVE));
      if (scroll && targets[0]) {
        targets[0].scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };

    apply(true);
    const onHashChange = () => apply(true);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    // Delegated so it survives chapter navigation without re-binding per verse.
    const onClick = (event: MouseEvent) => {
      const marker = (event.target as HTMLElement | null)?.closest?.(".v > .verse");
      if (!marker) return;

      const wrapper = marker.parentElement as HTMLElement | null;
      const verse = wrapper?.dataset.v;
      if (!verse) return;

      const container = wrapper?.closest(".bible-content");
      if (!container) return;

      const segments = versesFor(container, Number(verse));

      // A second click on a highlighted verse clears it, along with a #V{n} hash
      // pointing at it — otherwise a reload would highlight it again.
      if (wrapper.classList.contains(ACTIVE)) {
        segments.forEach((el) => el.classList.remove(ACTIVE));
        const hashVerse = /^#V(\d+)$/.exec(window.location.hash)?.[1];
        if (hashVerse && versesFor(container, Number(hashVerse)).includes(wrapper)) {
          window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
        }
        return;
      }

      // Text comes straight from the DOM: every segment of the verse, minus the
      // number marker itself.
      const text = segments
        .map((el) => {
          const clone = el.cloneNode(true) as HTMLElement;
          clone.querySelectorAll(".verse").forEach((m) => m.remove());
          return clone.textContent ?? "";
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!text) return;

      const url = new URL(window.location.href);
      url.hash = `V${verse}`;
      void navigator.clipboard?.writeText(`${text}\n${url.toString()}`);

      segments.forEach((el) => el.classList.add(ACTIVE));
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
