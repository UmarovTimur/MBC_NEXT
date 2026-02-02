import Link from "next/link";
import { ContainerWidth } from "@/shared/ui/Container";
import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";
import { BooksList } from "@/features/bible-navigation/ui/BooksList";
import { getDictionary } from "@/shared/lib/get-dictionary";
import { ChaptersTable } from "@/features/bible-navigation/ui/ChaptersTable";

export const Navbar = () => {
  const isBiblePage = true;

  const t = getDictionary();

  return (
    <header className="py-4 border-b border-border outline-ring/50 fixed w-full bg-white dark:bg-zinc-950 z-50">
      <ContainerWidth className="relative flex h-7 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="">
            <h1 className="text-xl font-bold text-black dark:text-white/80">MBC NEXT</h1>
          </Link>
        </div>
        <div className="flex gap-3 items-center">
          {isBiblePage && (
            <>
              <BooksList label={t("books")} />
              <ChaptersTable label={t("chapters")} intro={t("Intro")} discription={t("Select a chapter")} />
            </>
          )}
          <ThemeSwitcher />
        </div>
      </ContainerWidth>
    </header>
  );
};
