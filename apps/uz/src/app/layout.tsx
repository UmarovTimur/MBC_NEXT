import type { Metadata } from "next";
import Script from "next/script";
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
import { NavigationLoader } from "@mbc/ui";
import { Suspense } from "react";

const domain = process.env.DOMAIN || "https://kitobook.com/";

export const metadata: Metadata = {
  title: {
    default: "MakDonaldning Injil kitobiga o'zbek tilidagi sharhlari",
    template: "%s | MBC sharhlari",
  },
  description:
    // eslint-disable-next-line max-len
    "William MakDonaldning Muqaddas Kitobga yozgan sharhlari o'zbek tilida. Barcha kitoblar va boblar bo'yicha bepul onlayn o'qish.",
  icons: "/favicon.ico",
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "MBC — Muqaddas Kitob Sharhlari",
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
      <head>
        <Script id="yandex-metrika" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],
          k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
          ym(51854858,"init",{id:51854858,clickmap:true,trackLinks:true,accurateTrackBounce:true});
        `}</Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/51854858"
              style={{ position: "absolute", left: "-9999px" }} alt="" />
          </div>
        </noscript>
      </head>
      <body className="flex w-full flex-col mt-8 lg:mt-0 justify-between min-h-screen min-w-90">
        <I18nProvider dict={dict}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ManifestProvider manifest={manifest}>
              <BibleUiProvider>
                <Suspense><NavigationLoader /></Suspense>
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
