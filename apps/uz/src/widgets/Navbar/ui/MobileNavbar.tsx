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

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="h-6 w-6" asChild variant="ghost" size="icon" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent aria-describedby="Mobile menu" side="top" className="px-0 pb-6 ">
          <SheetHeader className="px-4">
            <SheetTitle>
              <Link href="/">
                <span className="text-xl font-bold text-black dark:text-white/80">
                  <span className="text-green-700 uppercase">Barclay</span>
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 text-xl grid gap-4 px-4">
            <AppLink href="https://kitobook.com/">KİTABLAR</AppLink>
            <AppLink href="https://www.kitobook.com/kitoblar/">Audio kitablar</AppLink>
            <AppLink href="https://www.kitobook.com/category/book/hikoyalar-kitobi/">Hekayələr</AppLink>
            <AppLink href="https://kitobook.com/uzmusic">İlahilər</AppLink>
            <AppLink href="https://www.kitobook.com/video/kino/">Filmlər və cizgi filmləri</AppLink>
            <AppLink href="https://www.kitobook.com/yes">Xilas haqqında müjdə</AppLink>
            <AppLink href="https://www.kitobook.com/gospel/">Xoş xəbər hekayələri</AppLink>
          </div>
          <div className="mt-6 flex items-center justify-between px-4">
            <ThemeSwitcher />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
