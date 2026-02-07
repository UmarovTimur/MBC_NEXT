import { ContainerWidth } from "@/shared/ui/Container";
import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";
import { AppLink } from "@/shared/ui/AppLink";
import { MobileNavbar } from "./MobileNavbar";
import { cn } from "@/shared/lib/utils";
import { ReactNode } from "react";
import { BooksList, ChaptersTableTrigger } from "@/features/bible-navigation";

export const Navbar = ({ actions }: { actions?: ReactNode }) => {

  return (
    <header
      className={cn(
        "top-0 py-4 border-b",
        " border-border outline-ring/50 fixed w-full bg-white dark:bg-zinc-950 z-50",
      )}
    >
      <ContainerWidth className="relative flex items-center justify-between">
        <div className="flex gap-x-6 items-center">
          <a href="/">
            <span className="text-xl font-bold text-black dark:text-white/80">
              <span className="text-green-700 uppercase">Kitobook</span>
              <span className="text-amber-800">.com</span>
            </span>
          </a>
          <div className="hidden lg:flex gap-x-5 pt-1.5 text-sm ">
            <AppLink href="https://kitobook.com/kitoblar/audio/">Audiokitoblar</AppLink>
            <AppLink href="https://kitobook.com/symphony/">Simfoniya</AppLink>
            <AppLink href="https://www.kitobook.com/web/guvohliklar-va-vazlari/masihiy-vazlari.html">
              Guvohliklar
            </AppLink>
            <AppLink href="https://www.kitobook.com/web/video">VIDEO</AppLink>
            <AppLink href="https://kitobook.com/uzmusic">UzMusic</AppLink>
          </div>
        </div>
        <div className="gap-x-3 flex items-center">
          <MobileNavbar />
          <div className="hidden lg:flex gap-x-3">
            {actions}
            <BooksList />
            {<ChaptersTableTrigger />}
            <ThemeSwitcher />
          </div>
        </div>
      </ContainerWidth>
    </header>
  );
};
