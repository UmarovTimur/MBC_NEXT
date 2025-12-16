import type { Metadata } from "next";
import "./styles/globals.css";
import { Navbar } from "@/widgets/Navbar";
import { Suspense } from "react";
import { Footer } from "@/widgets/Footer/Footer";
import { ThemeProvider, useTheme } from "./providers/ThemeProviders";

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
    <html lang="en">
      <ThemeProvider>
        <body className="flex flex-col justify-between min-h-screen">
          <Navbar />
          <main className="flex-1 shrink">
            <Suspense>{children}</Suspense>
          </main>
          <Footer />
        </body>
      </ThemeProvider>
    </html>
  );
}
