import type { Metadata } from "next";
import "./styles/globals.css";
import { Suspense } from "react";
import { Footer } from "@/widgets/Footer";
import { ThemeProvider } from "./providers/ThemeProviders";
import { Navbar } from "@/widgets/Navbar";

export const metadata: Metadata = {
  title: "MBC NEXT",
  description: "",
  icons: "/favicon.ico",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {

  return (
    <html lang={process.env.APP_LANG}>
      <ThemeProvider>
        <body className="flex w-full flex-col justify-between min-h-screen">
          <Navbar />
          <main className="flex-1 shrink py-15">
            <Suspense>{children}</Suspense>
          </main>
          <Footer />
        </body>
      </ThemeProvider>
    </html>
  );
}
