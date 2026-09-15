"use client";

import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";
import { MobileNavbar } from "./MobileNavbar";
import { cn } from "@/shared/lib/utils";
import { useHideOnScroll } from "@/shared/lib/useHideOnScroll";
import { NavBibleControls } from "./NavBibleControls";
import { NavBibleLinks } from "./NavBibleLinks";
import { NavLink } from "./NavLink";
import { AppLink } from "@/shared/ui/AppLink";
import { Button } from "@/shared/ui/button";
import { useI18n } from "@/app/providers/I18n/ui/useI18n";
import { Search } from "lucide-react";

export const Navbar = () => {
  const { t } = useI18n();
  const isHidden = useHideOnScroll();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transform-gpu border-b border-stone-200 bg-background px-3 transition-transform duration-300 ease-in-out will-change-transform dark:border-white/10",
        isHidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex h-14.5 items-center justify-between dark:border-white/10  sm:px-6">
        <div className="flex min-w-0 items-center gap-x-5 self-stretch">
          <AppLink
            href="/"
            className="mb-1 shrink-0 text-2xl font-bold leading-none text-[#101820] transition-colors dark:text-white"
          >
            {t("siteName")}
          </AppLink>

          <NavBibleLinks className="hidden gap-x-4 self-stretch lg:flex" />
          <NavLink href="/books" className="hidden lg:inline-flex">
            {t("books")}
          </NavLink>
          <NavLink href="/simfoniya" className="hidden lg:inline-flex">
            {t("symphonyTitle")}
          </NavLink>
        </div>

        <div className="flex items-center gap-x-3">
          <AppLink
            href="/search"
            className="hidden h-9 min-w-64 items-center gap-3 rounded-md border border-stone-200 bg-stone-50/80 px-4 text-sm text-zinc-500 shadow-sm transition-colors hover:bg-white xl:flex dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10"
            aria-label={t("navSearchPlaceholder")}
          >
            <Search className="size-4" />
            <span>{t("navSearchPlaceholder")}</span>
          </AppLink>
          {/* Below xl the search box above does not fit, so search collapses to an
              icon that sits next to the menu button rather than disappearing. */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 xl:hidden"
            aria-label={t("searchTitle")}
            title={t("searchTitle")}
          >
            <AppLink href="/search">
              <Search aria-hidden="true" />
            </AppLink>
          </Button>
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
