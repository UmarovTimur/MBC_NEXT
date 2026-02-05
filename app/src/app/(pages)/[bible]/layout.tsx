import { BooksList } from "@/features/bible-navigation";
import { BibleUiProvider } from "@/features/bible-navigation/model/BibleUIContext";
import { ChaptersTableTrigger } from "@/features/bible-navigation/";
import { Navbar } from "@/widgets/Navbar";
import { ReactNode, Suspense } from "react";

interface BibleLayoutProps {
  children: ReactNode;
}

export default function BibleLayout({ children }: BibleLayoutProps) {
  const navbarActions = (
    <>
      <BooksList />
      <ChaptersTableTrigger />
    </>
  );
  return (
    <BibleUiProvider>
      <Navbar actions={navbarActions} />
      <main className="flex-1 shrink pt-15 lg:pb-12">
        <section>
          <Suspense>{children}</Suspense>
        </section>
      </main>
    </BibleUiProvider>
  );
}
