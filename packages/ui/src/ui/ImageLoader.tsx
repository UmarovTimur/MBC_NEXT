import type { ImageLoaderProps } from "next/image";

const DEFAULT_QUALITY = 75;

export const imageLoader = ({ src, width, quality }: ImageLoaderProps): string => {
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  const q = quality ?? DEFAULT_QUALITY;
  const hashIndex = src.indexOf("#");
  const base = hashIndex === -1 ? src : src.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : src.slice(hashIndex);
  const separator = base.includes("?") ? "&" : "?";
  const url = `${base}${separator}w=${width}&q=${q}`;

  return hash ? `${url}${hash}` : url;
};
