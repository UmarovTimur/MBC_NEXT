"use client";

import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";
import { MobileNavbar } from "./MobileNavbar";
import { cn } from "@/shared/lib/utils";
import { NavBibleControls } from "./NavBibleControls";
import { NavBibleLinks } from "./NavBibleLinks";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import { Search } from "lucide-react";
import { useI18n } from "@/app/providers/I18n/ui/useI18n";

export const Navbar = () => {
  const { t } = useI18n();

  return (
    <header
      className={cn(
        "fixed inset-x-0 z-50 bg-background transition-colors border-b border-stone-200 dark:border-white/10",
      )}
    >
      <div className="mx-auto flex h-[58px] items-center justify-between dark:border-white/10  sm:px-6">
        <div className="flex min-w-0 items-center gap-x-5">
          <AppLink
            href="/"
            className="mb-[4px] shrink-0 text-2xl font-bold leading-none text-[#101820] transition-colors dark:text-white"
          >
            {t("siteName")}
          </AppLink>

          <NavBibleLinks className="hidden items-center gap-x-2 lg:flex" linkClassName="text-sm text-zinc-700 dark:text-zinc-200" />
          <Button className="hidden rounded-full px-4 text-sm text-zinc-700 hover:bg-stone-100 lg:inline-flex dark:text-zinc-200 dark:hover:bg-white/10" asChild variant="ghost">
            <AppLink href="/books">{t("books")}</AppLink>
          </Button>
        </div>

        <div className="flex items-center gap-x-3">
          {/* <AppLink
            href="/books"
            className="hidden h-10 min-w-64 items-center gap-3 rounded-full border border-stone-200 bg-stone-50/80 px-4 text-sm text-zinc-500 transition-colors hover:bg-white xl:flex dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10"
            aria-label={t("navSearchPlaceholder")}
          >
            <Search className="size-4" />
            <span>{t("navSearchPlaceholder")}</span>
          </AppLink> */}
          <MobileNavbar />
          <div className="hidden items-center gap-x-3 lg:flex">
            <NavBibleControls />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};
