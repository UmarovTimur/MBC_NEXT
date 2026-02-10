import type { Metadata } from "next";
import "./styles/globals.css";
import { Footer } from "@/widgets/Footer";
import { ThemeProvider } from "./providers/Theme";
import { ManifestProvider } from "@/entities/bible/context/ManifestProvider";
import { bibleManager } from "@/entities/bible/server";
import { I18nProvider } from "@/app/providers/I18n";
import { getI18n } from "@/app/providers/I18n/server";
import { notoSansFont } from "@/shared/config/fonts";
import { Navbar } from "@/widgets/Navbar";
import { BibleUiProvider } from "@/features/bible-navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "MBC",
  description: "MakDonaldning Injil kitobiga o'zbek tilidagi sharhlari",
  icons: "/favicon.ico",
  openGraph: {
    images: ["https://kitobook.com/images/mcdonald.jpg"],
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
      <I18nProvider dict={dict}>
        <ThemeProvider>
          <body className="flex w-full flex-col mt-8 lg:mt-0 justify-between min-h-screen min-w-90">
            <ManifestProvider manifest={manifest}>
              <BibleUiProvider>
                <Navbar />
                <main className="grow mt-10 lg:mt-16">
                  <Suspense>{children}</Suspense>
                </main>
                <Footer />
              </BibleUiProvider>
            </ManifestProvider>
          </body>
        </ThemeProvider>
      </I18nProvider>
    </html>
  );
}
