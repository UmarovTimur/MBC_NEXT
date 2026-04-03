import type { Metadata } from "next";
import "./styles/globals.css";
import { Footer } from "@/widgets/Footer";
import { ThemeProvider } from "./providers/Theme";
import { ManifestProvider } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import { I18nProvider } from "@/app/providers/I18n";
import { getI18n } from "@/app/providers/I18n/server";
import { notoSansFont } from "@/shared/config/fonts";
import { Navbar } from "@/widgets/Navbar";
import { BibleUiProvider } from "@/features/bible-navigation";
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
  const { dict } = getI18n();

  return (
    <html className={notoSansFont.variable} lang={process.env.APP_LANG} suppressHydrationWarning>
      <body className="flex w-full flex-col mt-8 lg:mt-0 justify-between min-h-screen min-w-90">
        <I18nProvider dict={dict}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ManifestProvider manifest={manifest}>
              <BibleUiProvider>
                <Navbar />
                <main className="grow mt-10 lg:mt-16">
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
