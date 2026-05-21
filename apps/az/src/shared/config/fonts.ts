import { Noto_Sans, Roboto_Condensed } from "next/font/google";

export const notoSansFont = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-noto-sans",
  preload: true
});

export const robotoCondensedFont = Roboto_Condensed({
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto-condensed",
  preload: false,
});
