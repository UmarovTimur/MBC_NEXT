"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AppLink } from "@/shared/ui/AppLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { ThemeSwitcher } from "@/shared/ui/ThemeSwitcher/ThemeSwitcher";
import { NavBibleLinks } from "./NavBibleLinks";
import { useI18n } from "@/app/providers/I18n/ui/useI18n";

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="h-10 w-10 rounded-full" variant="ghost" size="icon" aria-label={t("navOpenMenu")}>
            <Menu suppressHydrationWarning />
          </Button>
        </SheetTrigger>
        <SheetContent aria-describedby="Mobile menu" side="top" className="border-stone-200 bg-[#fbfaf7] px-0 pb-6 dark:border-white/10 dark:bg-zinc-950">
          <SheetHeader className="px-4">
            <SheetTitle>
              <Link href="/">
                <span className="font-serif text-2xl font-bold text-[#101820] dark:text-white">
                  {t("siteName")}
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-5 flex flex-col gap-y-2 px-2">
            <NavBibleLinks className="flex-col items-start gap-y-2" linkClassName="px-3 py-2 text-xl" />
            <Button asChild variant="ghost" className="h-12 justify-start rounded-xl">
              <AppLink className="px-3 text-xl" href="/books">{t("books")}</AppLink>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-between px-4">
            <ThemeSwitcher />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
