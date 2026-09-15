import type { CSSProperties } from "react";

import { cn } from "../lib/utils";

interface MaskIconProps {
  /** URL of a single-colour SVG, e.g. one from the app's `public/`. */
  src: string;
  className?: string;
}

/**
 * An SVG file used as a CSS mask, so the icon takes the current text colour —
 * including in dark mode — which an <img> of the same file cannot do. Size it
 * with width/height classes; colour it with `text-*`.
 */
export function MaskIcon({ src, className }: MaskIconProps) {
  const style: CSSProperties = { maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` };
  return (
    <span
      aria-hidden
      className={cn("block shrink-0 bg-current mask-contain mask-center mask-no-repeat", className)}
      style={style}
    />
  );
}
