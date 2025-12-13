import type { Metadata } from "next";
import "./styles/globals.css";
import { Navbar } from "@/widgets/Navbar";
import { Suspense } from "react";
import { Footer } from "@/widgets/Footer/Footer";

export const metadata: Metadata = {
  title: "MBC NEXT",
  description: "",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="flex flex-col justify-between min-h-screen">
        <Navbar />
        <main className="flex-1 shrink">
          <Suspense>{children}</Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
