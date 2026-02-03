import type { Metadata } from "next";
import "./styles/globals.css";
import { Suspense } from "react";
import { Footer } from "@/widgets/Footer";
import { ThemeProvider } from "./providers/Theme";
import { Navbar } from "@/widgets/Navbar";
import { ManifestProvider } from "@/entities/bible/context/ManifestProvider";
import { bibleManager } from "@/entities/bible/server";
import { I18nProvider } from "./providers/I18n";
import { getI18n } from "./providers/I18n/server";

export const metadata: Metadata = {
  title: "MBC NEXT",
  description: "",
  icons: "/favicon.ico",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const manifest = bibleManager.getManifest();
  const { dict } = getI18n();

  return (
    <html lang={process.env.APP_LANG}>
      <I18nProvider dict={dict}>
        <ThemeProvider>
          <body className="flex w-full flex-col justify-between min-h-screen min-w-90">
            <ManifestProvider manifest={manifest}>
              <Navbar />
              <main className="flex-1 shrink pt-15 pb-8 md:pb-12">
                <Suspense>{children}</Suspense>
              </main>
              <Footer />
            </ManifestProvider>
          </body>
        </ThemeProvider>
      </I18nProvider>
    </html>
  );
}
