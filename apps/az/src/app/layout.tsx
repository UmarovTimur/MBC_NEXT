import type { Metadata } from "next";
import "./styles/globals.css";
import { Footer } from "@/widgets/Footer";
import { ThemeProvider } from "./providers/Theme";
import { ManifestProvider } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { I18nProvider } from "@/app/providers/I18n";
import { getI18n } from "@/app/providers/I18n/server";
import { notoSansFont, robotoCondensedFont } from "@/shared/config/fonts";
import { Navbar } from "@/widgets/Navbar";
import { BibleUiProvider } from "@/features/bible-navigation";
import { NavigationLoader } from "@mbc/ui";
import { Suspense } from "react";

const domain = process.env.DOMAIN || "https://kitobook.com/";

export const metadata: Metadata = {
  title: {
    default: "Vilyam Barklinin Müqəddəs Kitab şərhləri — Azərbaycan dilində",
    template: "%s | Barclay şərhləri",
  },
  description:
    "Vilyam Barklinin Müqəddəs Kitaba yazdığı şərhlər Azərbaycan dilində. Bütün kitablar və fəsillər üzrə pulsuz onlayn oxu.",
  icons: "/favicon.ico",
  openGraph: {
    siteName: "Barclay — Müqəddəs Kitab Şərhləri",
    images: [`${domain}images/mcdonald.jpg`],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const manifest = bibleManager.getManifest();
  const { dictionary } = getI18n();

  return (
    <html className={`${notoSansFont.variable} ${robotoCondensedFont.variable}`} lang={process.env.APP_LANG} suppressHydrationWarning>
      <body className="flex min-h-screen w-full min-w-90 flex-col justify-between bg-[#ebe9e4]">
        <I18nProvider dict={dictionary}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ManifestProvider manifest={manifest}>
              <BibleUiProvider>
                <Suspense><NavigationLoader /></Suspense>
                <Navbar />
                <main className="grow pt-24 pb-10">
                  <Suspense>{children}</Suspense>
                </main>
                <Footer />
              </BibleUiProvider>
            </ManifestProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
