// import { BibleUiProvider } from "@/features/bible-navigation/model/BibleUIContext";
import { ReactNode } from "react";

interface BibleLayoutProps {
  children: ReactNode;
}

export default function BibleLayout({ children }: BibleLayoutProps) {
  return (
    <>
      <main className="flex-1 shrink pt-15 lg:pb-12">
        <section>
          {children}
        </section>
      </main>
    </>
  );
}
